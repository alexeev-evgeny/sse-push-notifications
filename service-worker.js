self.addEventListener('install', (event) => {
    console.warn('SERVICE WORKER INSTALL');
    self.skipWaiting();
})

self.addEventListener('activate', (event) => {
    console.warn('SERVICE WORKER ACTIVATE');
    connectToStream(event);
})

function connectToStream(event) {
    const eventSource = new EventSource("/stream");
    console.warn('CONNECTED TO STREAM', event);

    eventSource.addEventListener('message', async ({ data }) => {
        console.error('=============================================');
        console.warn('NEW MESSAGE', data);

        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                if (!clientList.length) {
                    return;
                }
                console.warn('CLIENTS', clientList);

                const [client] = clientList;
                client.postMessage(JSON.parse(data));
            });
    })


    eventSource.addEventListener('close', () => {
        console.error("END OF STREAM!");
        eventSource.close();
    })
}
