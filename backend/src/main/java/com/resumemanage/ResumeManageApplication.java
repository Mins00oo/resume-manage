package com.resumemanage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ResumeManageApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeManageApplication.class, args);
    }
}
