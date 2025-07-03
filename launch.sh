#!/bin/bash

echo "==================================="
echo "🚀 ft_transcendence Setup & Launch"
echo "==================================="

# Controlla se il file .env esiste
if [ ! -f .env ]; then
    echo "❌ File .env non trovato!"
    exit 1
fi

# Leggi HOST_ID dal file .env
HOST_ID=$(grep '^HOST_ID=' .env | cut -d '=' -f2)

if [ -z "$HOST_ID" ]; then
    echo "❌ HOST_ID non trovato nel file .env!"
    exit 1
fi

echo "📋 Configurazione rilevata:"
echo "   HOST_ID: $HOST_ID"
echo "   Backend: https://trascendence.be:9443 (https://$HOST_ID:9443)"
echo "   Frontend: https://trascendence.fe:8443 (https://$HOST_ID:8443)"
echo ""

# Controlla se i certificati esistono
if [ ! -f frontend/cert/cert.pem ] || [ ! -f frontend/cert/key.pem ]; then
    echo "❌ Certificati SSL non trovati in frontend/cert/"
    echo "   Assicurati che cert.pem e key.pem esistano"
    exit 1
fi

echo "✅ Certificati SSL trovati"

# Aggiungi gli host al file hosts se non esistono già
if ! grep -q "trascendence.be\|trascendence.fe" /etc/hosts; then
    echo "📝 Aggiungendo entries al file hosts..."
    echo "$HOST_ID trascendence.be trascendence.fe" | sudo tee -a /etc/hosts
    echo "✅ Host entries aggiunti"
else
    echo "✅ Host entries già presenti"
fi

echo ""
echo "🐳 Avviando i container Docker..."
echo ""

# Stop e rimuovi container esistenti
docker-compose down

# Build e avvia i nuovi container
docker-compose up --build -d

echo ""
echo "🎉 Avvio completato!"
echo ""
echo "🌐 Accedi tramite:"
echo "   Frontend: https://trascendence.fe:8443"
echo "   Backend API: https://trascendence.be:9443/api"
echo ""
echo "📡 Per WebSocket (multiplayer):"
echo "   wss://trascendence.be:9443/ws/game"
echo ""
