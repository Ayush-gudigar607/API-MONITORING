import { EventEmitter } from "node:events"; //Mainly used for custom messsages

export class ConformChannelManager extends EventEmitter {
  constructor({ rabbitmq, logger }) {
    super();
    this.rabbitmq = rabbitmq;
    this.logger = logger || console;
    this.channel = null;
    this._connecting = false;
  };

  async getChannel() {
    if (this.channel) return this.channel;
    if (this._connecting) {
      //here we will manage concurrecy
      return new Promise((resolve, reject) => {
        this._connectWaiters.push({ resolve, reject });
      });
    }

    return this._connect();
  }

  async _connect() {
    this._connecting = true;
    try {
      let connection;
      if (this.rabbitmq.connection) {
        connection = this.rabbitmq.connection;
      } else {
        const basechannel = await this.rabbitmq.connect();
        if (!basechannel)
          throw new Error("Failed to establish connection to RabbitMQ");
        connection = basechannel.connection;
      }

      const conformChannel = await connection.createConfirmChannel();

      conformChannel.on("drain", () => {
        this.emit("drain");
      });

      conformChannel.on("close", () => {
        this.logger.warn("Conform channel closed, resetting channel reference");
        this.channel = null;
      });

      conformChannel.on("error", (err) => {
        this._logger.error("Conform channel error:", {
          error: err.message,
          stack: err.stack,
          code: err.code,
        });
        this.channel = null;
        this.emit("error", err);
      });

      this.channel = conformChannel;
      this.logger.info("Conform channel established successfully");

      //for  people can assign above on what about remaining one
      for(const w of this._connectWaiters) w.resolve(conformChannel);
      this._connectWaiters = [];
      return conformChannel;
    } catch (error) {
        for(const w of this._connectWaiters) w.reject(error);
        this._connectWaiters = [];
        throw error;
    }
    finally{
        this._connecting=false;
    }
  }
}
