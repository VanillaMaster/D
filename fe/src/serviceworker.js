export const {
    registration,
    worker
} = await (async function(){
    if (navigator.serviceWorker === undefined) return {
        registration: null,
        worker: null
    }
    const registration = await navigator.serviceWorker.register("/worker", {
        type: 'module',
        scope: "/"
    });
    const { active: worker } = /**@type { { active: ServiceWorker } } */ (registration);
    return { registration, worker }
})();