#!/bin/bash

# Script per aggiungere gli host locali
echo "127.0.0.1 trascendence.be trascendence.fe" | sudo tee -a /etc/hosts

echo "Host entries added successfully!"
echo "You can now access:"
echo "- Backend: https://trascendence.be"
echo "- Frontend: https://trascendence.fe"
echo "- Alternative access:"
echo "  - http://localhost (redirects to https)"
