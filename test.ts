// tests go here; this will not be compiled when this package is used as an extension.
KeyboardInput.enableKeyboard()
game.onPaint(() => {
    screen.printCenter(KeyboardInput.getLastCharacter(), 60)
})