#!/bin/bash

# Leggi HOST_ID dal file .env
if [ -f .env ]; then
    HOST_ID=$(grep '^HOST_ID=' .env | cut -d '=' -f2)
else
    echo "File .env non trovato!"
    exit 1
fi

if [ -z "$HOST_ID" ]; then
    echo "HOST_ID non trovato nel file .env!"
    exit 1
fi

# Script per aggiungere gli host locali
echo "$HOST_ID transcendence.be transcendence.fe" | sudo tee -a /etc/hosts

echo "Host entries added successfully!"
echo "HOST_ID: $HOST_ID"
echo "You can now access:"
echo "- Backend: https://transcendence.be:9443"
echo "- Frontend: https://transcendence.fe:8443"
