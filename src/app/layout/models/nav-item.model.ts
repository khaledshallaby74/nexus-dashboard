/**
 * Represents an individual navigation link within the application menus.
 * Designed to support routing, external linking, badges, and Role-Based Access Control (RBAC).
 */
export interface NavItem {
    label:string;
    icon:string;
    route:string;
    /** Optional notification badge displayed alongside the menu item */
    badge?:{
        value:number,
        color: 'danger' | 'warning' | 'success' | 'info'
    };
    /** Optional absolute URL if the item should redirect outside the application */
    externalLink?:string;
    /** List of authorized user roles required to view this specific menu item */
    roles?:string[];
}
/**
 * Represents a logical grouping of navigation items, usually displayed with a header.
 * Useful for organizing sidebars or mega-menus into semantic sections.
 */
export interface NavGroup{
    groupName:string;
    items:NavItem[];
}