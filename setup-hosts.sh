#!/bin/bash

# Script per aggiungere gli host locali
echo "127.0.0.1 trascendence.be trascendence.fe" | sudo tee -a /etc/hosts

echo "Host entries added successfully!"
echo "You can now access:"
echo "- Backend: https://trascendence.be:8443"
echo "- Frontend: https://trascendence.fe:8443"
echo "- Alternative access:"
echo "  - http://localhost:8080 (redirects to https://localhost:8443)"
echo "  - https://localhost:8443"
