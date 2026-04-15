package com.resumemanage.file.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.upload")
public record FileStorageProperties(String rootPath) {
}
