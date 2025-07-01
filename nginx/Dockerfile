FROM alpine:3.20

# Installa Nginx e OpenSSL
RUN apk add --no-cache nginx openssl

# Crea le directory necessarie
RUN mkdir -p /etc/nginx/ssl /var/log/nginx /var/lib/nginx/tmp /usr/share/nginx/html

# Genera certificati SSL auto-firmati
RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem -days 365 -nodes \
    -subj "/C=IT/ST=State/L=City/O=Organization/CN=trascendence.local" \
    -addext "subjectAltName=DNS:trascendence.be,DNS:trascendence.fe,DNS:localhost,IP:127.0.0.1"

# Copia la configurazione di Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crea il file di configurazione principale
RUN echo 'user nginx;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /var/run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'events {' >> /etc/nginx/nginx.conf && \
    echo '    worker_connections 1024;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Crea la directory per le configurazioni
RUN mkdir -p /etc/nginx/conf.d

# Copia la configurazione del sito
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Imposta i permessi
RUN chown -R nginx:nginx /var/log/nginx /var/lib/nginx /usr/share/nginx/html

# Espone le porte 80 e 443
EXPOSE 80 443

# Comando per avviare Nginx
CMD ["nginx", "-g", "daemon off;"]
