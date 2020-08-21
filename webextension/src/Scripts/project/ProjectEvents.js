export default class ProjectEvents {
    static Page = class {
        static Initialize = "PageInitialize";
        static PageLoaded = "PageLoaded";
        static CreatePageTabState = "PageRegistration";
    }

    static Notification = class {
        static Clicked = "NotificationClicked";
    }

    static Tab = class {
        static BypassCertificateSecurity = "BypassCertificateSecurity";
    }

    static Options = class {
        static RenderInput = "OptionsRenderInput";
        static BindInput = "OptionsBindInput";
        static GetInput = "OptionsGetInput";
        static InputChange = "OptionsInputChange";
    }
}