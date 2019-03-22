/**
 * 
 * Define Duck's symbols here
 * Goog pratice Duck's enum name is to use the uppercase scheme:
 *     '<DUCK SELECTOR>'
 * 
 */

export enum CATEGORIES {
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

    GETALL = '@categories/get-all',
    GETID = '@categories/get-id',
    ADD = '@categories/add',
    UPDATE = '@categories/update',
    DELETE = '@categories/delete',
}
