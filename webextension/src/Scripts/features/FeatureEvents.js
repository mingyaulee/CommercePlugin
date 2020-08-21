export default class FeatureEvents {
    static Automation = class {
        static Run = "RunAutomation";
        static RunInNewTab = "RunAutomationInNewTab";
        static GetAutomationByTabState = "GetAutomationByTabState";
        static GetAutomationById = "GetAutomationById";
    }

    static Background = class {
        static Initialize = "InitializeBackgroundListeners";
        static MessageReceived = "MessageReceived";
    }

    static PageEvents = class {
        static InitializeListeners = "InitializePageEventListeners";
        static CheckEvents = "CheckEvents";
        static CheckEventProgress = "CheckEventProgress";
        static EventUpdated = "EventUpdated";
        static ParseObject = "ParseObject";
        static AddEvent = "AddEvent";
        static GetEvents = "GetEvents";
        static SetEvents = "SetEvents";
        static CurrentEventsUpdated = "CurrentEventsUpdated";
    }

    static Tab = class {
        static TabUpdated = "TabUpdated";
        static TabRemoved = "TabRemoved";
        static NavigationError = "NavigationError";
        static GetTabState = "GetTabState";
        static UpdateTabState = "UpdateTabState";
    }

    static Option = class {
        static Updated = "OptionUpdated";
    }

    static Notification = class {
        static Send = "NotificationSend";
    }
}