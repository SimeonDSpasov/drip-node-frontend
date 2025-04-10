# IPI Loader Service
A service that provides an easy way to show and hide a Loader in your app. The component itself is created/destroyed dynamically.

## Usage

### Step 1 (Initialize):
Initialize the service globally, i.e in your AppComponent or LayoutComponent and pass the required parameters
```ts
AppComponent {

    constructor(
        private loaderService: LoaderService,
        private viewContainerRef: ViewContainerRef) { }

    public ngOnInit(): void {
        this.loaderService.init(this.viewContainerRef, '.app-container');
    }
}
```

Let's take a closer look at the init method and what it accepts:
```ts
init(viewContainerRef: ViewContainerRef, appContainerElement?: string)
```

***viewContainerRef*** - The first argument is required and always needs to be passed. Its where the Loader Component will be created dynamically. In case of AppComponent Container Ref - the component will be created inside the <body> element.

***appContainerElement*** - The second argument is the appContainerElement Class selector. This selector is used to set opacity to 0.4 on the full content of the app. Its optional and if not passed, only the Blur effect will occur. Notice that the loader shouldnt be displayed inside this container or it will affect its opacity as well.

### Step 2 (Show/Hide):
Call show() and hide() methods using the service. You can do that anywhere in your app. Only the Initialization happens once and more globally.

```ts
this.loaderService.show();
```

```ts
this.loaderService.hide();
```

## CSS Variables
Here are all the available CSS variables (and their default values) you can set when using the ipi-loader:

```css
ipi-loader {
    --ipi-loader-backdrop-background: #0B1222;
    --ipi-loader-color: no-default-value; /* 249, 97, 56; */

    /* 
        Color has no default value because we need Comma Separated values for the RGBA.
        So if not passed, the loader is black without opacity.
    */
}
```

Notice that those should be global. The best place is in your global css (styles.css) using the :root selector.

[Go back](/README.md)
