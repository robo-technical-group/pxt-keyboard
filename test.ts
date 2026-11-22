// tests go here; this will not be compiled when this package is used as an extension.
Keyboard.enableKeyboard()
game.onPaint(() => {
    screen.printCenter(Keyboard.getLastCharacter(), 60)
})