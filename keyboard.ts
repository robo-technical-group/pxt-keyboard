//% block="Keyboard" color=#8B4513 icon="\uf11c"
namespace KeyboardInput {
    export enum Modifiers {
        None       = 0,
        Shift      = 0b1,
        Ctrl       = 0b10,
        Alt        = 0b100,
        AltGr      = 0b1000,
        Meta       = 0b10000,
        Acute      = 0b100000,
        Grave      = 0b1000000,
        Circumflex = 0b10000000,
        Diaeresis  = 0b100000000,
        Cedilla    = 0b1000000000,
        Tilde      = 0b10000000000,
    }

    export interface Key {
        chars: string[],
        isPrintable: boolean,
        /**
         * Also used as the index when defining keyboard layouts.
         */
        key: browserEvents.Key,
        keyButton: browserEvents.KeyButton,
        /**
         * Additional handlers for special keys; typically null.
         */
        pressedHandler: () => void,
        releasedHandler: () => void,
    }

    export interface Layout {
        keys: Key[],
        pressedHandler: (k: browserEvents.Key) => void,
        releasedHandler: (k: browserEvents.Key) => void,
    }

    let charHandlers: ((c: string) => void)[] = []
    let enabled: boolean = false
    let keyPressedHandlers: ((k: browserEvents.Key) => void)[] = []
    let keyReleasedHandlers: ((k: browserEvents.Key) => void)[] = []
    let lastChar: string = ""
    let lastKey: browserEvents.Key = null
    let layout: Layout = null
    let modifiers: number = 0

    //% block
    export function disableKeyboard(): void {
        enabled = false
        keymap.setSystemKeys(keymap.KeyCode.P, keymap.KeyCode.R, keymap.KeyCode.Tilde, keymap.KeyCode.Backspace)
        keymap.setPlayerKeys(1, keymap.KeyCode.UpArrow, keymap.KeyCode.DownArrow, keymap.KeyCode.LeftArrow, keymap.KeyCode.RightArrow, keymap.KeyCode.Space, keymap.KeyCode.Enter)
        keymap.setPlayerKeys(2, keymap.KeyCode.I, keymap.KeyCode.K, keymap.KeyCode.J, keymap.KeyCode.L, keymap.KeyCode.U, keymap.KeyCode.O)
    }

    //% block
    export function enableKeyboard(): void {
        keymap.setSystemKeys(0, 0, 0, 0)
        keymap.setPlayerKeys(1, 0, 0, 0, 0, 0, 0)
        keymap.setPlayerKeys(2, 0, 0, 0, 0, 0, 0)
        if (layout == null) {
            setLayout(KB_EN_US)
        }
        enabled = true
    }

    //% block
    export function getLastCharacter(): string {
        return lastChar
    }

    //% block
    export function getLastKey(): browserEvents.Key {
        return lastKey
    }

    export function getModifiers(): number {
        return modifiers
    }

    function handleKeyPress(k: browserEvents.Key): void {
        if (!enabled) {
            return
        }
        for (let h of keyPressedHandlers) {
            h(k)
        }
        lastKey = k
        let key: Key = layout.keys[k]
        if (key.isPrintable) {
            let c: string = ""
            if (key.chars[modifiers] != undefined) {
                c = key.chars[modifiers]
            } else if (
                (modifiers & Modifiers.Shift) == Modifiers.Shift &&
                key.chars[Modifiers.Shift] != undefined
            ) {
                c = key.chars[Modifiers.Shift]
            } else {
                c = key.chars[Modifiers.None]
            }
            if (c.length > 0) {
                lastChar = c
            }
            for (let h of charHandlers) {
                h(c)
            }
        }
    }

    function handleKeyRelease(k: browserEvents.Key): void {
        if (!enabled) {
            return
        }
        for (let h of keyReleasedHandlers) {
            h(k)
        }
    }

    //% block
    export function isKeyboardEnabled(): boolean {
        return enabled
    }

    //% block
    export function isShifted(): boolean {
        return (modifiers & Modifiers.Shift) == Modifiers.Shift
    }

    //% block
    //% draggableParameters="reporter"
    export function onCharTyped(handler: (chars: string) => void): void {
        charHandlers.push(handler)
    }

    //% block
    //% draggableParameters="reporter"
    export function onKeyPressed(handler: (key: browserEvents.Key) => void): void {
        keyPressedHandlers.push(handler)
    }

    //% block
    //% draggableParameters="reporter"
    export function onKeyReleased(handler: (key: browserEvents.Key) => void): void {
        keyReleasedHandlers.push(handler)
    }

    export function setLayout(kbLayout: Layout): void {
        layout = kbLayout

        // Need to allow for change in layout at runtime.
        // This will suffice for now.
        for (let k of layout.keys) {
            if (k != null) {
                k.keyButton.addEventListener(browserEvents.KeyEvent.Pressed,
                    () => handleKeyPress(k.key))
                k.keyButton.addEventListener(browserEvents.KeyEvent.Released,
                    () => handleKeyRelease(k.key))
                if (layout.pressedHandler != null) {
                    k.keyButton.addEventListener(browserEvents.KeyEvent.Pressed,
                        () => layout.pressedHandler(k.key))
                }
                if (layout.releasedHandler != null) {
                    k.keyButton.addEventListener(browserEvents.KeyEvent.Released,
                        () => layout.releasedHandler(k.key))
                }
                if (k.pressedHandler != null) {
                    k.keyButton.addEventListener(browserEvents.KeyEvent.Pressed,
                        k.pressedHandler)
                }
                if (k.releasedHandler != null) {
                    k.keyButton.addEventListener(browserEvents.KeyEvent.Released,
                        k.releasedHandler)
                }
            }
        }
    }

    /**
     * Helper functions
     */

    export function clearFlag(f: number): void {
        modifiers &= ~f
    }

    export function setFlag(f: number): void {
        modifiers |= f
    }

    export function toggleFlag(f: number): void {
        modifiers ^= f
    }
}
