export declare enum MainAction {
    PROPERTY_SETS = "Property sets",
    PROPERTIES = "Properties",
    QUIT = "QUIT"
}
export declare const mainMenu: () => Promise<MainAction>;
export declare const handleMainMenu: (onCancel?: () => Promise<void>) => Promise<void>;
