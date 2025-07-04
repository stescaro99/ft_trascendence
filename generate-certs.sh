#!/bin/bash

echo "🔐 Generazione certificati SSL per ft_transcendence"
echo "=================================================="

# Leggi HOST_ID dal file .env
if [ -f .env ]; then
    HOST_ID=$(grep '^HOST_ID=' .env | cut -d '=' -f2)
else
    echo "File .env non trovato, usando HOST_ID predefinito"
    HOST_ID="192.168.1.61"
fi

echo "HOST_ID: $HOST_ID"

# Crea la directory cert se non existe
mkdir -p frontend/cert

# Genera i certificati
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes -keyout frontend/cert/key.pem -out frontend/cert/cert.pem \
    -subj "/CN=$HOST_ID" \
    -addext "subjectAltName=DNS:transcendence.be,DNS:transcendence.fe,IP:$HOST_ID,DNS:localhost,IP:127.0.0.1"

echo ""
echo "✅ Certificati generati con successo in frontend/cert/"
echo "   - cert.pem"
echo "   - key.pem"
echo ""
echo "🎯 I certificati sono validi per:"
echo "   - $HOST_ID"
echo "   - transcendence.be"
echo "   - transcendence.fe" 
echo "   - localhost"
echo "   - 127.0.0.1"
echo ""
echo "⚠️  Ricorda di accettare il certificato self-signed nel browser!"
