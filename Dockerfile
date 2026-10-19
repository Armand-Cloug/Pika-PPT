# syntax=docker/dockerfile:1
FROM python:3.13-alpine AS catalog
WORKDIR /build
COPY scripts/build_catalog.py scripts/build_catalog.py
COPY dashboard dashboard
COPY presentations presentations
RUN python scripts/build_catalog.py --output /site \
    && find /site -type d -exec chmod 755 {} + \
    && find /site -type f -exec chmod 644 {} +

FROM nginx:1.28-alpine AS runtime
LABEL org.opencontainers.image.title="Pika-PPT" \
      org.opencontainers.image.source="https://github.com/armand-cloug/Pika-PPT" \
      fr.cloug.project="pika-ppt"
RUN apk add --no-cache openssl \
    && rm -rf /usr/share/nginx/html /etc/nginx/conf.d /docker-entrypoint.d \
    && mkdir -p /tmp/pika && chown nginx:nginx /tmp/pika
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/pika-entrypoint
COPY --from=catalog /site /usr/share/nginx/html
USER nginx:nginx
RUN nginx -t
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8081/healthz || exit 1
ENTRYPOINT ["/usr/local/bin/pika-entrypoint"]
