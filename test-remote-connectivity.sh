#!/bin/bash

# Script per testare la connettività da una macchina remota
# Esegui questo script dalla macchina remota dopo aver configurato /etc/hosts

echo "=== Test Connettività ft_transcendence ==="
echo

# Test risoluzione DNS
echo "1. Test risoluzione domini:"
echo "trascendence.be -> $(getent hosts trascendence.be | awk '{print $1}')"
echo "trascendence.fe -> $(getent hosts trascendence.fe | awk '{print $1}')"
echo

# Test connessione backend
echo "2. Test connessione backend:"
if curl -k -f -s https://trascendence.be:9443/swagger > /dev/null; then
    echo "✅ Backend raggiungibile (https://trascendence.be:9443)"
else
    echo "❌ Backend NON raggiungibile"
fi

# Test connessione frontend
echo "3. Test connessione frontend:"
if curl -k -f -s https://trascendence.fe:8443 > /dev/null; then
    echo "✅ Frontend raggiungibile (https://trascendence.fe:8443)"
else
    echo "❌ Frontend NON raggiungibile"
fi

# Test API backend
echo "4. Test API backend:"
API_RESPONSE=$(curl -k -s -w "%{http_code}" https://trascendence.be:9443/api/health -o /dev/null)
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
    echo "✅ API backend risponde (HTTP $API_RESPONSE)"
else
    echo "❌ API backend non risponde (HTTP $API_RESPONSE)"
fi

# Test directory uploads
echo "5. Test directory uploads:"
UPLOADS_RESPONSE=$(curl -k -s -w "%{http_code}" https://trascendence.be:9443/uploads/ -o /dev/null)
if [ "$UPLOADS_RESPONSE" = "404" ] || [ "$UPLOADS_RESPONSE" = "200" ]; then
    echo "✅ Directory uploads configurata (HTTP $UPLOADS_RESPONSE)"
else
    echo "❌ Problema con directory uploads (HTTP $UPLOADS_RESPONSE)"
fi

echo
echo "=== Istruzioni ==="
echo "Se vedi degli errori:"
echo "1. Verifica che /etc/hosts contenga: 192.168.1.61 trascendence.be trascendence.fe"
echo "2. Controlla che il firewall permetta le porte 8443 e 9443"
echo "3. Assicurati di essere nella stessa rete della macchina host"
echo
echo "Per accedere:"
echo "- Frontend: https://trascendence.fe:8443"
echo "- Backend Swagger: https://trascendence.be:9443/swagger"
echo "- Immagini: https://trascendence.be:9443/uploads/nome_file"
echo
echo "Nota: Dovrai accettare i certificati self-signed nel browser"
