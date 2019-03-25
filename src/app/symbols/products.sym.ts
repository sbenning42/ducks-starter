/**
 * 
 * Define Duck's symbols here
 * Goog pratice Duck's enum name is to use the uppercase scheme:
 *     '<DUCK SELECTOR>'
 * 
 */

export enum PRODUCTS {
    /**
     * 
     * Define action and correlation types here.
     * Goog pratice for action types is to use the lowercase scheme:
     *     '@<duck selector>/<action name>'
     * Goog pratice for correlation types is to use the scheme:
     *     '@<duck selector>-<correlation name>'
     * 
     *     ADD_DOTO = '@todos/add-todo'
     * 
     *     ADD_DOTO_CORRELATION = '@todos-add-todo'
     * 
     */

    GETALL = '@products/get-all',
    GETID = '@products/get-id',
    ADD = '@products/add',
    UPDATE = '@products/update',
    REMOVE = '@products/remove',
}
