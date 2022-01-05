export declare enum PropertyAction {
    EDIT_SIMPLE = "See / edit existing simple properties",
    EDIT_COMPLEX = "See / edit existing complex properties",
    EDIT_ENUMERATION = "See / edit existing property enumerations",
    ADD_SIMPLE = "Create a simple property",
    ADD_COMPLEX = "Create a complex property",
    ADD_ENUMERATION = "Create an property enumeration to reference in enumerated properties",
    REMOVE = "Delete an existing property",
    BACK = "Back to main menu"
}
export declare const handleManageProperties: () => Promise<void>;
