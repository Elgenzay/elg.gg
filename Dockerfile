FROM rust:latest
WORKDIR /usr/src/elg_gg
ENV ROCKET_PROFILE=production
RUN apt-get update && apt-get install -y build-essential

COPY Cargo.toml Rocket.toml Cargo.lock ./
COPY src ./src
COPY static ./static

RUN cargo install --path .
EXPOSE 80
CMD ["elg_gg"]
