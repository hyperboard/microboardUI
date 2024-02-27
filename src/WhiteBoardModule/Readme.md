# WhiteBoardModule

Add on parent element handler event

    document.addEventListener('keydown', e => {
      const frame = document.getElementById('iframe')
      if (frame) {
        frame.contentDocument?.dispatchEvent(new KeyboardEvent('keydown', {key: e.key}));
      }
    })

## Example usage

    const whiteboardModule = new WhiteboardModuleView();

    whiteboardModule.render({
      container: container (HTMLElement),
      baseUrl: baseUrl,
      boardId: boardId,
      userToken: userToken
    });