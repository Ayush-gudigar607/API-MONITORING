

export const CircuitState=Object.freeze({
    CLOSED:"CLOSED",
    OPEN:"OPEN",
    HALF_OPEN:"HALF_OPEN"
})

export class CircuitBreaker{
    constructor(opts={})
    {
        this.failureThreshold=opts.failureThreshold || 5 //number of failures before opening the circuit
        this.cooldownMs=opts.cooldownMs || 30000;//this is the time in milliseconds that the circuit will stay open before trying to reset
        this.halfOpenMaxAttempts=opts.halfOpenMaxAttempts || 2;//number of attempts allowed in half-open state before deciding to open the circuit again}
        this.logger=opts.logger || console

        this._state=CircuitState.CLOSED
        this._failures=0
        this._halfOpenAttempts=0
        this.lastFailureTime=0
        this.halfopenSuccesses=0

    };

    _cooldownElasped()
    {
        return Date.now()-this.lastFailureTime>this.cooldownMs
    }
   
    _transitionTo(newState)
    {
        const prev=this._state;
        this._state=newState
         if(newState===CircuitState.OPEN)
        {
            this.halfOpenAttempts=0
            this.halfopenSuccesses=0
            this.logger.info(`[CircuitBreaker] ${prev}=>HALF_OPEN`)
        }
    }


    _openCircuit()
    {
        this._lastFailureTime=Date.now()
        this._transitionTo(CircuitState.OPEN)
        this.logger.error(`[circuitBreaker] OPEN`,{
            failures:this._failures,
            cooldownMs:this.cooldownMs
        })
    }
   //Method
    _reset()
    {
        this._state=CircuitState.CLOSED
        this._failures=0
        this._halfOpenAttempts=0
        this.halfopenSuccesses=0

    }
  

    //current state of the circuit
    get state()
    {
        if(this._state===CircuitState.OPEN && this._cooldownElasped())
        {
            this._transitionTo(CircuitState.HALF_OPEN)
        }

        return this._state
    }

    allowrequest()
    {
        const currentState=this.state;

        if(currentState===CircuitState.CLOSED)
        {
            return true;
        }
        if(currentState===CircuitState.HALF_OPEN)
        {
            if(this._halfOpenAttempts<this.halfOpenMaxAttempts)
            {
                this._halfOpenAttempts++;
                return true;
            }

            return false;
        }
     //if the request is open then doesnot allow requests
        return false;

    }

 //if the equest has error then it will cooldown it thwn we use the suceess
    onSuccess()
    {
       if(this._state===CircuitState.HALF_OPEN)
        {
            this.halfopenSuccesses++;
            if(this.halfopenSuccesses>=this.halfOpenMaxAttempts)
            {
                this._reset();
                this.logger.info(`[CircuitBreaker] reset to closed after successful attempts in half-open state`)
            }
            return;
        }

        //closed state me success hone par failure counter reset kar do
        if(this._failures>0)
        {
            this._failures=0
            this.logger.info(`[CircuitBreaker] failure counter reset to 0 after success`)
        }
    }


    onFailure()
    {
        if(this._state===CircuitState.HALF_OPEN)
        {
            this.logger.info(`[CircuitBreaker] failure in half-open state, opening circuit again`)
            this._openCircuit()
            return;
        }

        this._failures++;
        this._lastFailureTime=Date.now()

        if(this._failures>=this.failureThreshold)
        {
            this._openCircuit()
        }
    }

    snapshot()
    {
        return {
            state:this._state,
            failures:this._failures,
            lastFailureTime:this._lastFailureTime,
            halfOpenAttempts:this._halfOpenAttempts,
            halfopenSuccesses:this.halfopenSuccesses,
            cooldownMs:this.cooldownMs,
            failureThreshold:this.failureThreshold
        }
    }

}