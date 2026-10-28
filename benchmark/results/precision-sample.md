# Precision sample

29 pairs sampled (seed 7) from the 692 that jscd reports on the unmodified corpus packages: up to 16 per type, at most one per clone class, Type-3 spread evenly over similarity bands. Labels live in [precision-labels.json](../precision-labels.json).

## 1. Type-1 · clone

`reactstrap/src/Col.js:40-49|reactstrap/src/Label.js:42-51`

```js
const getColumnSizeClass = (isXs, colWidth, colSize) => {
  if (colSize === true || colSize === '') {
    return isXs ? 'col' : `col-${colWidth}`;
  }
  if (colSize === 'auto') {
    return isXs ? 'col-auto' : `col-${colWidth}-auto`;
  }

  return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
};
```

```js
const getColumnSizeClass = (isXs, colWidth, colSize) => {
  if (colSize === true || colSize === '') {
    return isXs ? 'col' : `col-${colWidth}`;
  }
  if (colSize === 'auto') {
    return isXs ? 'col-auto' : `col-${colWidth}-auto`;
  }

  return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
};
```

## 2. Type-1 · clone

`reactstrap/src/Modal.js:160-176|reactstrap/src/Offcanvas.js:130-146`

```js
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.init();
      this.setState({ isOpen: true });
      // let render() renders Modal Dialog first
      return;
    }

    // now Modal Dialog is rendered and we can refer this._element and this._dialog
    if (this.props.autoFocus && this.state.isOpen && !prevState.isOpen) {
      this.setFocus();
    }

    if (this._element && prevProps.zIndex !== this.props.zIndex) {
      this._element.style.zIndex = this.props.zIndex;
    }
  }
```

```js
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.init();
      this.setState({ isOpen: true });

      return;
    }

    // now Offcanvas Dialog is rendered and we can refer this._element and this._dialog
    if (this.props.autoFocus && this.state.isOpen && !prevState.isOpen) {
      this.setFocus();
    }

    if (this._element && prevProps.zIndex !== this.props.zIndex) {
      this._element.style.zIndex = this.props.zIndex;
    }
  }
```

## 3. Type-1 · clone

`lodash-es/_Hash.js:14-23|lodash-es/_MapCache.js:14-23`

```js
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
```

```js
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
```

## 4. Type-1 · clone

`reactstrap/src/Modal.js:139-158|reactstrap/src/Offcanvas.js:109-128`

```js
  componentDidMount() {
    const { isOpen, autoFocus, onEnter } = this.props;

    if (isOpen) {
      this.init();
      this.setState({ isOpen: true });
      if (autoFocus) {
        this.setFocus();
      }
    }

    if (onEnter) {
      onEnter();
    }

    // traps focus inside the Modal, even if the browser address bar is focused
    document.addEventListener('focus', this.trapFocus, true);

    this._isMounted = true;
  }
```

```js
  componentDidMount() {
    const { isOpen, autoFocus, onEnter } = this.props;

    if (isOpen) {
      this.init();
      this.setState({ isOpen: true });
      if (autoFocus) {
        this.setFocus();
      }
    }

    if (onEnter) {
      onEnter();
    }

    // traps focus inside the Offcanvas, even if the browser address bar is focused
    document.addEventListener('focus', this.trapFocus, true);

    this._isMounted = true;
  }
```

## 5. Type-1 · clone

`reactstrap/src/Modal.js:178-194|reactstrap/src/Offcanvas.js:148-164`

```js
  componentWillUnmount() {
    this.clearBackdropAnimationTimeout();

    if (this.props.onExit) {
      this.props.onExit();
    }

    if (this._element) {
      this.destroy();
      if (this.props.isOpen || this.state.isOpen) {
        this.close();
      }
    }

    document.removeEventListener('focus', this.trapFocus, true);
    this._isMounted = false;
  }
```

```js
  componentWillUnmount() {
    this.clearBackdropAnimationTimeout();

    if (this.props.onExit) {
      this.props.onExit();
    }

    if (this._element) {
      this.destroy();
      if (this.props.isOpen || this.state.isOpen) {
        this.close();
      }
    }

    document.removeEventListener('focus', this.trapFocus, true);
    this._isMounted = false;
  }
```

## 6. Type-2 · clone

`semantic-ui-react/src/collections/Menu/MenuHeader.js:10-21|semantic-ui-react/src/views/Item/ItemExtra.js:16-27`

```js
function MenuHeader(props) {
  const { children, className, content } = props
  const classes = cx('header', className)
  const rest = getUnhandledProps(MenuHeader, props)
  const ElementType = getElementType(MenuHeader, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function ItemExtra(props) {
  const { children, className, content } = props
  const classes = cx('extra', className)
  const rest = getUnhandledProps(ItemExtra, props)
  const ElementType = getElementType(ItemExtra, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 7. Type-2 · clone

`semantic-ui-react/src/views/Card/CardDescription.js:18-29|semantic-ui-react/src/views/Card/CardMeta.js:18-29`

```js
function CardDescription(props) {
  const { children, className, content, textAlign } = props
  const classes = cx(useTextAlignProp(textAlign), 'description', className)
  const rest = getUnhandledProps(CardDescription, props)
  const ElementType = getElementType(CardDescription, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function CardMeta(props) {
  const { children, className, content, textAlign } = props
  const classes = cx(useTextAlignProp(textAlign), 'meta', className)
  const rest = getUnhandledProps(CardMeta, props)
  const ElementType = getElementType(CardMeta, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 8. Type-2 · clone

`reactstrap/src/UncontrolledButtonDropdown.js:8-29|reactstrap/src/UncontrolledPopover.js:8-29`

```js
export default class UncontrolledButtonDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.defaultOpen || false };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    return (
      <ButtonDropdown
        isOpen={this.state.isOpen}
        toggle={this.toggle}
        {...omit(this.props, omitKeys)}
      />
    );
  }
}
```

```js
export default class UncontrolledPopover extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.defaultOpen || false };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    return (
      <Popover
        isOpen={this.state.isOpen}
        toggle={this.toggle}
        {...omit(this.props, omitKeys)}
      />
    );
  }
}
```

## 9. Type-2 · clone

`semantic-ui-react/src/elements/Placeholder/Placeholder.js:20-37|semantic-ui-react/src/elements/Reveal/RevealContent.js:16-34`

```js
function Placeholder(props) {
  const { children, className, content, fluid, inverted } = props
  const classes = cx(
    'ui',
    useKeyOnly(fluid, 'fluid'),
    useKeyOnly(inverted, 'inverted'),
    'placeholder',
    className,
  )
  const rest = getUnhandledProps(Placeholder, props)
  const ElementType = getElementType(Placeholder, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function RevealContent(props) {
  const { children, className, content, hidden, visible } = props

  const classes = cx(
    'ui',
    useKeyOnly(hidden, 'hidden'),
    useKeyOnly(visible, 'visible'),
    'content',
    className,
  )
  const rest = getUnhandledProps(RevealContent, props)
  const ElementType = getElementType(RevealContent, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 10. Type-2 · clone

`reactstrap/src/CardBody.js:20-34|reactstrap/src/ToastBody.js:17-31`

```js
function CardBody(props) {
  const {
    className,
    cssModule,
    innerRef,
    tag: Tag = 'div',
    ...attributes
  } = props;
  const classes = mapToCssModules(
    classNames(className, 'card-body'),
    cssModule,
  );

  return <Tag {...attributes} className={classes} ref={innerRef} />;
}
```

```js
function ToastBody(props) {
  const {
    className,
    cssModule,
    innerRef,
    tag: Tag = 'div',
    ...attributes
  } = props;
  const classes = mapToCssModules(
    classNames(className, 'toast-body'),
    cssModule,
  );

  return <Tag {...attributes} className={classes} ref={innerRef} />;
}
```

## 11. Type-2 · clone

`reactstrap/src/Modal.js:279-293|reactstrap/src/Offcanvas.js:227-241`

```js
  onClosed(node) {
    const { unmountOnClose } = this.props;
    // so all methods get called before it is unmounted
    this.props.onClosed();
    (this.props.modalTransition.onExited || noop)(node);

    if (unmountOnClose) {
      this.destroy();
    }
    this.close();

    if (this._isMounted) {
      this.setState({ isOpen: false });
    }
  }
```

```js
  onClosed(node) {
    const { unmountOnClose } = this.props;
    // so all methods get called before it is unmounted
    this.props.onClosed();
    (this.props.offcanvasTransition.onExited || noop)(node);

    if (unmountOnClose) {
      this.destroy();
    }
    this.close();

    if (this._isMounted) {
      this.setState({ isOpen: false });
    }
  }
```

## 12. Type-2 · clone

`reactstrap/src/Modal.js:219-244|reactstrap/src/Offcanvas.js:180-205`

```js
  handleTab(e) {
    if (e.which !== 9) return;
    if (this.modalIndex < Modal.openCount - 1) return; // last opened modal

    const focusableChildren = this.getFocusableChildren();
    const totalFocusable = focusableChildren.length;
    if (totalFocusable === 0) return;
    const currentFocus = this.getFocusedChild();

    let focusedIndex = 0;

    for (let i = 0; i < totalFocusable; i += 1) {
      if (focusableChildren[i] === currentFocus) {
        focusedIndex = i;
        break;
      }
    }

    if (e.shiftKey && focusedIndex === 0) {
      e.preventDefault();
      focusableChildren[totalFocusable - 1].focus();
    } else if (!e.shiftKey && focusedIndex === totalFocusable - 1) {
      e.preventDefault();
      focusableChildren[0].focus();
    }
  }
```

```js
  handleTab(e) {
    if (e.which !== 9) return;
    if (this.offcanvasIndex < Offcanvas.openCount - 1) return; // last opened offcanvas

    const focusableChildren = this.getFocusableChildren();
    const totalFocusable = focusableChildren.length;
    if (totalFocusable === 0) return;
    const currentFocus = this.getFocusedChild();

    let focusedIndex = 0;

    for (let i = 0; i < totalFocusable; i += 1) {
      if (focusableChildren[i] === currentFocus) {
        focusedIndex = i;
        break;
      }
    }

    if (e.shiftKey && focusedIndex === 0) {
      e.preventDefault();
      focusableChildren[totalFocusable - 1].focus();
    } else if (!e.shiftKey && focusedIndex === totalFocusable - 1) {
      e.preventDefault();
      focusableChildren[0].focus();
    }
  }
```

## 13. Type-2 · clone

`semantic-ui-react/src/modules/Dropdown/DropdownHeader.js:17-38|semantic-ui-react/src/views/Feed/FeedLike.js:11-32`

```js
function DropdownHeader(props) {
  const { children, className, content, icon } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(DropdownHeader, props)
  const ElementType = getElementType(DropdownHeader, props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}
```

```js
function FeedLike(props) {
  const { children, className, content, icon } = props

  const classes = cx('like', className)
  const rest = getUnhandledProps(FeedLike, props)
  const ElementType = getElementType(FeedLike, props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}
```

## 14. Type-3 · 82% · clone

`lodash-es/intersectionBy.js:31-43|lodash-es/intersectionWith.js:28-39`

```js
var intersectionBy = baseRest(function(arrays) {
  var iteratee = last(arrays),
      mapped = arrayMap(arrays, castArrayLikeObject);

  if (iteratee === last(mapped)) {
    iteratee = undefined;
  } else {
    mapped.pop();
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped, baseIteratee(iteratee, 2))
    : [];
});
```

```js
var intersectionWith = baseRest(function(arrays) {
  var comparator = last(arrays),
      mapped = arrayMap(arrays, castArrayLikeObject);

  comparator = typeof comparator == 'function' ? comparator : undefined;
  if (comparator) {
    mapped.pop();
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped, undefined, comparator)
    : [];
});
```

## 15. Type-3 · 81% · clone

`semantic-ui-react/src/collections/Menu/MenuMenu.js:10-22|semantic-ui-react/src/views/Comment/CommentAction.js:16-28`

```js
function MenuMenu(props) {
  const { children, className, content, position } = props

  const classes = cx(position, 'menu', className)
  const rest = getUnhandledProps(MenuMenu, props)
  const ElementType = getElementType(MenuMenu, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function CommentAction(props) {
  const { active, className, children, content } = props

  const classes = cx(useKeyOnly(active, 'active'), className)
  const rest = getUnhandledProps(CommentAction, props)
  const ElementType = getElementType(CommentAction, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 16. Type-3 · 85% · clone

`semantic-ui-react/src/elements/Container/Container.js:18-36|semantic-ui-react/src/modules/Dropdown/DropdownMenu.js:16-33`

```js
function Container(props) {
  const { children, className, content, fluid, text, textAlign } = props
  const classes = cx(
    'ui',
    useKeyOnly(text, 'text'),
    useKeyOnly(fluid, 'fluid'),
    useTextAlignProp(textAlign),
    'container',
    className,
  )
  const rest = getUnhandledProps(Container, props)
  const ElementType = getElementType(Container, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function DropdownMenu(props) {
  const { children, className, content, direction, open, scrolling } = props
  const classes = cx(
    direction,
    useKeyOnly(open, 'visible'),
    useKeyOnly(scrolling, 'scrolling'),
    'menu transition',
    className,
  )
  const rest = getUnhandledProps(DropdownMenu, props)
  const ElementType = getElementType(DropdownMenu, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 17. Type-3 · 83% · clone

`reactstrap/src/UncontrolledButtonDropdown.js:8-29|reactstrap/src/UncontrolledDropdown.js:8-36`

```js
export default class UncontrolledButtonDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.defaultOpen || false };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    return (
      <ButtonDropdown
        isOpen={this.state.isOpen}
        toggle={this.toggle}
        {...omit(this.props, omitKeys)}
      />
    );
  }
}
```

```js
export default class UncontrolledDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.defaultOpen || false };
    this.toggle = this.toggle.bind(this);
  }

  toggle(e) {
    this.setState(
      (prevState) => ({ isOpen: !prevState.isOpen }),
      () => {
        if (this.props.onToggle) {
          this.props.onToggle(e, this.state.isOpen);
        }
      },
    );
  }

  render() {
    return (
      <Dropdown
        isOpen={this.state.isOpen}
        toggle={this.toggle}
        {...omit(this.props, omitKeys)}
      />
    );
  }
}
```

## 18. Type-3 · 85% · clone

`semantic-ui-react/src/collections/Table/TableHeader.js:16-27|semantic-ui-react/src/elements/Icon/IconGroup.js:11-22`

```js
function TableHeader(props) {
  const { children, className, content, fullWidth } = props
  const classes = cx(useKeyOnly(fullWidth, 'full-width'), className)
  const rest = getUnhandledProps(TableHeader, props)
  const ElementType = getElementType(TableHeader, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function IconGroup(props) {
  const { children, className, content, size } = props
  const classes = cx(size, 'icons', className)
  const rest = getUnhandledProps(IconGroup, props)
  const ElementType = getElementType(IconGroup, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 19. Type-3 · 89% · clone

`semantic-ui-react/src/collections/Message/MessageList.js:18-29|semantic-ui-react/src/views/Comment/CommentActions.js:10-21`

```js
function MessageList(props) {
  const { children, className, items } = props
  const classes = cx('list', className)
  const rest = getUnhandledProps(MessageList, props)
  const ElementType = getElementType(MessageList, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? _.map(items, MessageItem.create) : children}
    </ElementType>
  )
}
```

```js
function CommentActions(props) {
  const { className, children, content } = props
  const classes = cx('actions', className)
  const rest = getUnhandledProps(CommentActions, props)
  const ElementType = getElementType(CommentActions, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 20. Type-3 · 86% · clone

`reactstrap/src/AccordionItem.js:21-35|reactstrap/src/NavItem.js:17-32`

```js
function AccordionItem(props) {
  const {
    className,
    cssModule,
    tag: Tag = 'div',
    innerRef,
    ...attributes
  } = props;
  const classes = mapToCssModules(
    classNames(className, 'accordion-item'),
    cssModule,
  );

  return <Tag {...attributes} className={classes} ref={innerRef} />;
}
```

```js
function NavItem(props) {
  const {
    className,
    cssModule,
    active,
    tag: Tag = 'li',
    ...attributes
  } = props;

  const classes = mapToCssModules(
    classNames(className, 'nav-item', active ? 'active' : false),
    cssModule,
  );

  return <Tag {...attributes} className={classes} />;
}
```

## 21. Type-3 · 87% · clone

`semantic-ui-react/src/modules/Rating/RatingIcon.js:34-55|semantic-ui-react/src/modules/Search/SearchResult.js:40-56`

> Borderline: two render() methods built on the library template (props, cx, getUnhandledProps, ElementType) with different JSX attributes and children.

```js
  render() {
    const { active, className, selected } = this.props
    const classes = cx(
      useKeyOnly(active, 'active'),
      useKeyOnly(selected, 'selected'),
      'icon',
      className,
    )
    const rest = getUnhandledProps(RatingIcon, this.props)
    const ElementType = getElementType(RatingIcon, this.props)

    return (
      <ElementType
        {...rest}
        className={classes}
        onClick={this.handleClick}
        onKeyUp={this.handleKeyUp}
        onMouseEnter={this.handleMouseEnter}
        role='radio'
      />
    )
  }
```

```js
  render() {
    const { active, className, renderer } = this.props

    const classes = cx(useKeyOnly(active, 'active'), 'result', className)
    const rest = getUnhandledProps(SearchResult, this.props)
    const ElementType = getElementType(SearchResult, this.props)

    // Note: You technically only need the 'content' wrapper when there's an
    // image. However, optionally wrapping it makes this function a lot more
    // complicated and harder to read. Since always wrapping it doesn't affect
    // the style in any way let's just do that.
    return (
      <ElementType {...rest} className={classes} onClick={this.handleClick}>
        {renderer(this.props)}
      </ElementType>
    )
  }
```

## 22. Type-3 · 94% · clone

`semantic-ui-react/src/modules/Modal/ModalHeader.js:16-27|semantic-ui-react/src/views/Comment/CommentContent.js:10-21`

```js
function ModalHeader(props) {
  const { children, className, content } = props
  const classes = cx('header', className)
  const rest = getUnhandledProps(ModalHeader, props)
  const ElementType = getElementType(ModalHeader, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function CommentContent(props) {
  const { className, children, content } = props
  const classes = cx(className, 'content')
  const rest = getUnhandledProps(CommentContent, props)
  const ElementType = getElementType(CommentContent, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 23. Type-3 · 92% · clone

`reactstrap/src/NavItem.js:17-32|reactstrap/src/ToastBody.js:17-31`

```js
function NavItem(props) {
  const {
    className,
    cssModule,
    active,
    tag: Tag = 'li',
    ...attributes
  } = props;

  const classes = mapToCssModules(
    classNames(className, 'nav-item', active ? 'active' : false),
    cssModule,
  );

  return <Tag {...attributes} className={classes} />;
}
```

```js
function ToastBody(props) {
  const {
    className,
    cssModule,
    innerRef,
    tag: Tag = 'div',
    ...attributes
  } = props;
  const classes = mapToCssModules(
    classNames(className, 'toast-body'),
    cssModule,
  );

  return <Tag {...attributes} className={classes} ref={innerRef} />;
}
```

## 24. Type-3 · 92% · clone

`semantic-ui-react/src/modules/Sidebar/SidebarPusher.js:16-28|semantic-ui-react/src/views/Card/CardHeader.js:18-29`

```js
function SidebarPusher(props) {
  const { className, dimmed, children, content } = props

  const classes = cx('pusher', useKeyOnly(dimmed, 'dimmed'), className)
  const rest = getUnhandledProps(SidebarPusher, props)
  const ElementType = getElementType(SidebarPusher, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function CardHeader(props) {
  const { children, className, content, textAlign } = props
  const classes = cx(useTextAlignProp(textAlign), 'header', className)
  const rest = getUnhandledProps(CardHeader, props)
  const ElementType = getElementType(CardHeader, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 25. Type-3 · 92% · clone

`semantic-ui-react/src/views/Feed/FeedLike.js:11-32|semantic-ui-react/src/views/Feed/FeedMeta.js:17-38`

```js
function FeedLike(props) {
  const { children, className, content, icon } = props

  const classes = cx('like', className)
  const rest = getUnhandledProps(FeedLike, props)
  const ElementType = getElementType(FeedLike, props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}
```

```js
function FeedMeta(props) {
  const { children, className, content, like } = props

  const classes = cx('meta', className)
  const rest = getUnhandledProps(FeedMeta, props)
  const ElementType = getElementType(FeedMeta, props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes}>
      {createShorthand(FeedLike, (val) => ({ content: val }), like, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}
```

## 26. Type-3 · 98% · clone

`semantic-ui-react/src/elements/List/ListDescription.js:16-27|semantic-ui-react/src/elements/List/ListHeader.js:16-27`

```js
function ListDescription(props) {
  const { children, className, content } = props
  const classes = cx(className, 'description')
  const rest = getUnhandledProps(ListDescription, props)
  const ElementType = getElementType(ListDescription, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function ListHeader(props) {
  const { children, className, content } = props
  const classes = cx('header', className)
  const rest = getUnhandledProps(ListHeader, props)
  const ElementType = getElementType(ListHeader, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 27. Type-3 · 98% · clone

`reactstrap/src/Modal.js:321-354|reactstrap/src/Offcanvas.js:268-301`

```js
  trapFocus(ev) {
    if (!this.props.trapFocus) {
      return;
    }

    if (!this._element) {
      // element is not attached
      return;
    }

    if (this._dialog && this._dialog.parentNode === ev.target) {
      // initial focus when the Modal is opened
      return;
    }

    if (this.modalIndex < Modal.openCount - 1) {
      // last opened modal
      return;
    }

    const children = this.getFocusableChildren();

    for (let i = 0; i < children.length; i += 1) {
      // focus is already inside the Modal
      if (children[i] === ev.target) return;
    }

    if (children.length > 0) {
      // otherwise focus the first focusable element in the Modal
      ev.preventDefault();
      ev.stopPropagation();
      children[0].focus();
    }
  }
```

```js
  trapFocus(ev) {
    if (!this.props.trapFocus) {
      return;
    }

    if (!this._element) {
      // element is not attached
      return;
    }

    if (this._dialog.current === ev.target) {
      // initial focus when the Offcanvas is opened
      return;
    }

    if (this.offcanvasIndex < Offcanvas.openCount - 1) {
      // last opened offcanvas
      return;
    }

    const children = this.getFocusableChildren();

    for (let i = 0; i < children.length; i += 1) {
      // focus is already inside the Offcanvas
      if (children[i] === ev.target) return;
    }

    if (children.length > 0) {
      // otherwise focus the first focusable element in the Offcanvas
      ev.preventDefault();
      ev.stopPropagation();
      children[0].focus();
    }
  }
```

## 28. Type-3 · 97% · clone

`semantic-ui-react/src/elements/Button/ButtonContent.js:16-32|semantic-ui-react/src/elements/Reveal/RevealContent.js:16-34`

```js
function ButtonContent(props) {
  const { children, className, content, hidden, visible } = props
  const classes = cx(
    useKeyOnly(visible, 'visible'),
    useKeyOnly(hidden, 'hidden'),
    'content',
    className,
  )
  const rest = getUnhandledProps(ButtonContent, props)
  const ElementType = getElementType(ButtonContent, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function RevealContent(props) {
  const { children, className, content, hidden, visible } = props

  const classes = cx(
    'ui',
    useKeyOnly(hidden, 'hidden'),
    useKeyOnly(visible, 'visible'),
    'content',
    className,
  )
  const rest = getUnhandledProps(RevealContent, props)
  const ElementType = getElementType(RevealContent, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

## 29. Type-3 · 96% · clone

`semantic-ui-react/src/views/Card/CardDescription.js:18-29|semantic-ui-react/src/views/Comment/CommentAction.js:16-28`

```js
function CardDescription(props) {
  const { children, className, content, textAlign } = props
  const classes = cx(useTextAlignProp(textAlign), 'description', className)
  const rest = getUnhandledProps(CardDescription, props)
  const ElementType = getElementType(CardDescription, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```

```js
function CommentAction(props) {
  const { active, className, children, content } = props

  const classes = cx(useKeyOnly(active, 'active'), className)
  const rest = getUnhandledProps(CommentAction, props)
  const ElementType = getElementType(CommentAction, props)

  return (
    <ElementType {...rest} className={classes}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}
```
