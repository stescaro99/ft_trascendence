const configRoutes = async (fastify: any) => {
	// Route per ottenere informazioni di configurazione host
	fastify.get('/host-config', async (request: any, reply: any) => {
		const host = request.headers.host;
		const hostId = process.env.HOST_ID;
		const isAccessViaIP = host && hostId && (
			host.includes(hostId) || 
			host.includes('localhost') || 
			host.includes('127.0.0.1')
		);

		return {
			accessViaIP: isAccessViaIP,
			hostId: hostId,
			currentHost: host,
			recommendedHostsEntry: hostId ? `${hostId} trascendence.be trascendence.fe` : null,
			setupCommand: {
				linux: hostId ? `echo "${hostId} trascendence.be trascendence.fe" | sudo tee -a /etc/hosts` : null,
				windows: hostId ? `echo ${hostId} trascendence.be trascendence.fe >> C:\\Windows\\System32\\drivers\\etc\\hosts` : null,
				manual: 'Modifica manualmente il file hosts del tuo sistema operativo'
			},
			optimalUrls: {
				frontend: 'https://trascendence.fe:8443',
				backend: 'https://trascendence.be:9443',
				swagger: 'https://trascendence.be:9443/swagger'
			},
			limitations: isAccessViaIP ? [
				'Google OAuth potrebbe non funzionare correttamente',
				'Alcune funzionalità potrebbero essere limitate',
				'CORS potrebbe causare problemi',
				'I certificati SSL potrebbero non essere validati correttamente'
			] : []
		};
	});
};

export default configRoutes;
