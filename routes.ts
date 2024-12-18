/**

 * Un array di routes che sono accessibili pubblicamente
 * Queste routes non richiedono autenticazione
 * @type {string[]}
 */

export const publicRoutes = [
    "/",
   
];

/**
 * Un array di routes che sono usate per l'autenticazione
 * Queste routes rindirizzano gli utenti loggati to /settings
 * @type {string[]}
 */

export const authRoutes = [
    "/auth/login",
    "/auth/register",
]
/**
 * Prefisso per api authentication routes
 * Routes che iniziano con questo prefisso sono usate per autenticazione api
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Redirect dopo il login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings"