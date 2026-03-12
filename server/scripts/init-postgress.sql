--Table
CREATE TABLE IF NOT EXISTS endpoints_metrics(
    id SERIAL PRIMARY KEY,
    -- this will  be come from mongodb database
    client_id VARCHAR(45) NOT NULL,   
    service_name VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    time_bucket TIMESTAMP NOT NULL,
    total_hits INTEGER DEFAULT 0,
    error_hits INTEGER DEFAULT 0,
    avg_latency NUMERIC(10,3) DEFAULT 0.000,
    min_latency NUMERIC(10,3) DEFAULT 0.000,
    max_latency NUMERIC(10,3) DEFAULT 0.000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  

)

--10:25