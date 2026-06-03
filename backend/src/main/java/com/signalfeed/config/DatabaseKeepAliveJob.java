package com.signalfeed.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;

@Component
public class DatabaseKeepAliveJob {

    private static final Logger log =
      LoggerFactory.getLogger(DatabaseKeepAliveJob.class);

    @Autowired
    private DataSource dataSource;

    @Scheduled(fixedDelay = 3600000) // every 60 minutes
    public void keepAlive() {
      try (Connection conn = dataSource.getConnection();
           PreparedStatement ps = conn.prepareStatement("SELECT 1")) {
        ps.executeQuery();
        log.debug("Database keep-alive ping successful");
      } catch (Exception e) {
        log.warn("Database keep-alive ping failed: {}", e.getMessage());
      }
    }
}
