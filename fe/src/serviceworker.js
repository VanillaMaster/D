export const registration = await navigator.serviceWorker.register("/worker", {
    type: 'module',
    scope: "/"
});

export const { active: worker } = /**@type { { active: ServiceWorker } } */ (registration);