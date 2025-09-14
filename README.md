# Copa Airlines Design System UI Icons

Creates a svg sprite for the ui icons.

## Rules

1. File name must be unique, it will be the identifier
2. File must be an svg with no image tag
3. Fills and Stroke attributes value must be **currentColor**
4. No width nor heigth attributes are allowed

## Building

Make sure to run `pnpm i` to install dependencies

Use `pnpm build` to generate the sprite file.

## Usage

On your HTML file

```html
<svg class="{className}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <use href="{...path to sprite}/sprite.svg#{fileName}" xlink:href="{...path to sprite}/sprite.svg#{fileName}"></use>
</svg>
```