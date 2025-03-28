// This appears to be a higher-order component for adding DevTools functionality
// Adding the missing function declaration at the beginning
export default function withDevTools(AppRootComponent) {
    const useOptionalKeepAwake = (() => {
        try {
            // Optionally import expo-keep-awake
            const { useKeepAwake, ExpoKeepAwakeTag } = require('expo-keep-awake');
            return () => useKeepAwake(ExpoKeepAwakeTag, { suppressDeactivateWarnings: true });
        }
        catch {
            // Return a no-op function if the module isn't available
        }
        return () => { };
    })();
    
    function WithDevTools(props) {
        useOptionalKeepAwake();
        return <AppRootComponent {...props}/>;
    }
    
    if (process.env.NODE_ENV !== 'production') {
        const name = AppRootComponent.displayName || AppRootComponent.name || 'Anonymous';
        WithDevTools.displayName = `withDevTools(${name})`;
    }
    
    return WithDevTools;
}
//# sourceMappingURL=withDevTools.js.map