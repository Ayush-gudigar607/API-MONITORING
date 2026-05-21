import amqp from "amqplib"
import config from "./index.js"
import logger from "./logger.js"

class RabbitMQConnection{
    constructor()
    {
        this.connection=null
        this.channel=null
        this.isConnecting=false
    }

    async connect()
    {
        if(this.channel)
        {
            return this.channel
        }
        if(this.isConnecting)
        {
            //a b c =====>
            //a b ======> c
            //a ======> b =====> c
            //if connection is in progress then wait for 100 ms and try again
            await new Promise(resolve=> {
                const checkInterval=setInterval(() => {
                    if(!this.isConnecting) {
                        clearInterval(checkInterval)
                        resolve()
                    }
                }, 100);
            })

            return this.channel
        }

        try {
            this.isConnecting=true
            logger.info("Connecting to RabbitMQ...",config.rabbitmq.url)
            this.connection=await amqp.connect(config.rabbitmq.url)
            this.channel=await this.connection.createChannel()

            //creating key
            const dlqName=`${config.rabbitmq.queue}.dlq`

            //DL QUEUE
            await this.channel.assertQueue(dlqName,
                {durable:true})

            //nORMAL QUEUE

            await this.channel.assertQueue(config.rabbitmq.queue,{
                durable:true,
                //i can give messages to the dead letter exchange when the message is rejected or expired
                arguments:{
                    "x-dead-letter-exchange":"",
                    "x-dead-letter-routing-key":dlqName
                }
            })

            logger.info("RabbitMQ connected successfully")
            
            //when connection is closed

            this.connection.on("close",()=>
            {
                logger.error("RabbitMQ connection closed");
                this.connection=null
                this.channel=null
                
            })

            //when error occurs

            this.connection.on('error',(err)=>
            {
                logger.error("RabbitMQ connection error",err)
                this.connection=null
                this.channel=null
            })

            this.isConnecting=false
            return this.channel

        } catch (error) {
            logger.error("Error connecting to RabbitMQ...", error)
            this.isConnecting=false
        }
        }

        getchannel()
        {
            return this.channel;
        }


        //which mainly for health check of rabbitmq connection
        getstatus()
        {
            if(!this.connection || !this.channel  )    return "disconnected"
            if(this.connection.closing) return "closing"
            return "connected"
         }

         async close()
         {
            try {
                if(this.channel)
                {
                    await this.channel.close()
                    this.channel=null   
                }
                if(this.connection)
                {
                    await this.connection.close()
                    this.connection=null
                }
                logger.info("RabbitMQ connection closed successfully")

            } catch (error) {
                logger.error("Error closing RabbitMQ connection", error)
            }
         }
            }

export default  new RabbitMQConnection
        
    


