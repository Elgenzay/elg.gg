FROM rust:1.75-alpine
WORKDIR /usr/src/elg_gg
ENV ROCKET_PROFILE=production

RUN apk add --no-cache \
    build-base \
    libressl-dev

COPY Cargo.toml Rocket.toml Cargo.lock ./
COPY src ./src
COPY static ./static

RUN cargo install --path .

EXPOSE 80
CMD ["elg_gg"]
