package com.juku;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class JukuApplication {
    public static void main(String[] args) {
        SpringApplication.run(JukuApplication.class, args);
    }
}
