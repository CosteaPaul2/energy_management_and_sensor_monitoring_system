# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17 AS builder

COPY ./pom.xml /root/
COPY ./src /root/src
WORKDIR /root
RUN mvn clean package -DskipTests

# Extract Spring Boot layers
RUN java -Djarmode=layertools -jar /root/target/chat-0.0.1-SNAPSHOT.jar extract

# Stage 2: Create the runtime image
FROM openjdk:17-jdk-slim-buster

# Set environment variables
ENV TZ=UTC
ENV PORT=8089

# Copy Spring Boot layers
COPY --from=builder /root/dependencies/ ./
COPY --from=builder /root/snapshot-dependencies/ ./
COPY --from=builder /root/spring-boot-loader/ ./
COPY --from=builder /root/application/ ./

EXPOSE 8089

# Run the application
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher","-XX:+UseContainerSupport -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1 -Xms512m -Xmx512m -XX:+UseG1GC -XX:+UseSerialGC -Xss512k -XX:MaxRAM=72m"]
