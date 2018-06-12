import {h, render} from 'preact'
import styled from 'preact-emotion'
import createState from 'flipstate/preact'
import R from 'ramda'

const {StateProvider, addState} = createState()
const Main = styled('div')`
  padding: 16px;
  height: 100%;
`
const View = styled('iframe')`
  width: 100%;
  height: 100%;
  border: 2px solid black;
  margin-top: 16px;
`

const AddressBarInput = styled('input')`
  width: 600px;
  margin-right: 8px;
`

const Checkbox = styled('input')`
`

const LabelText = styled('span')`
  color: ${({disabled}) => disabled ? '#9b9b9b' : 'inherit'}
`
const Button = styled('button')`
  margin-bottom: 8px;
  margin-right: 8px;
`

const StateContainer = styled('div')`
  padding: 4px;
  font-family: "Lucida Console", Monaco, monospace;
  white-space: pre;
  border: ${({editing}) => editing ? '2px solid red' : '2px solid lightgrey'}
`

function renderStateEditor (editingState, state, updateApplicationStateEditorState, path = [], level = 0) {
  if (typeof state === 'string') {
    return <span><input type="text" value={state} disabled={!editingState} onChange={(event) => updateApplicationStateEditorState(path, event)}/>{'\n'}</span>
  }
  if (typeof state === 'boolean') {
    return <span><input type="checkbox" checked={state} disabled={!editingState} onChange={(event) => updateApplicationStateEditorState(path, event)}/>{'\n'}</span>
  }
  if (state instanceof Array) {
    const result = [`[\n`]
    state.forEach((value, index) => {
      result.push(`${' '.repeat(2 * (level + 1))}`)
      result.push(renderStateEditor(editingState, value, updateApplicationStateEditorState, [...path, index], level + 1))
    })
    result.push(`${' '.repeat(2 * level)}]\n`)
    return result.join('')
  }
  const result = [`{\n`]
  Object.keys(state).sort().forEach((key) => {
    result.push(`${' '.repeat(2 * (level + 1))}${key}: `)
    result.push(renderStateEditor(editingState, state[key], updateApplicationStateEditorState, [...path, key], level + 1))
  })
  result.push(`${' '.repeat(2 * level)}}\n`)
  return result
}

const State = () => <DevToolState>{({editingState, applicationState, applicationStateEditorState, updateApplicationStateEditorState}) => {
  return <StateContainer editing={editingState}>
    {renderStateEditor(editingState, editingState
      ? applicationStateEditorState
      : applicationState, updateApplicationStateEditorState)}
  </StateContainer>
}}</DevToolState>

function getOrigin (url) {
  const anchor = document.createElement('a')
  anchor.href = url
  return anchor.origin
}

const DevToolState = addState('DevTool', {
  addressBarUrl: 'http://localhost:8080/',
  udpateAddressBarUrl (state, {target: {value: addressBarUrl}}) {
    return {
      addressBarUrl
    }
  },
  gotoAddress ({addressBarUrl}) {
    return {
      applicationUrl: addressBarUrl
    }
  },
  applicationUrl: '',
  applicationState: {},
  autoRefresh: false,
  getState () {
    const application = document.getElementById('application').contentWindow
    application.postMessage({
      type: 'get state'
    }, '*')
  },
  updateAutoRefresh ({getState, subscribeState}, {target: {checked: autoRefresh}}) {
    if (autoRefresh) {
      getState()
      subscribeState()
    }
    return {
      autoRefresh
    }
  },
  subscribeState () {
    const application = document.getElementById('application').contentWindow
    application.postMessage({
      type: 'subscribe state update'
    }, '*')
  },
  applicationMessage ({applicationUrl, autoRefresh, editingState, subscribeState}, event) {
    console.log(event)
    const {origin, data = {}} = event
    if (origin !== getOrigin(applicationUrl)) {
      return
    }
    if (data.protocol !== 'flipstate-devtool v1') {
      return
    }
    if (editingState) {
      return
    }
    switch (data.type) {
      case 'application state':
        if (autoRefresh) {
          subscribeState()
        }
        return {
          addressBarUrl: data.location,
          applicationState: JSON.parse(data.state)
        }
    }
  },
  editingState: false,
  startEditState ({applicationState}) {
    return {
      editingState: true,
      applicationStateEditorState: applicationState
    }
  },
  cancelEditState ({getState}) {
    getState()
    return {
      editingState: false
    }
  },
  updateApplicationStateEditorState ({applicationStateEditorState}, path, {target: {type, checked, value}}) {
    return {
      applicationStateEditorState: R.set(R.lensPath(path), type
        ? checked
        : value, applicationStateEditorState)
    }
  },
  saveEditState ({getState, applicationStateEditorState}) {
    const application = document.getElementById('application').contentWindow
    application.postMessage({
      type: 'set state',
      state: JSON.stringify(applicationStateEditorState)
    }, '*')
    getState()
    return {
      editingState: false
    }
  }
})

const DevTool = () =>
  <DevToolState>{({applicationUrl, backAddress, forwardAddress, addressBarUrl, udpateAddressBarUrl, gotoAddress, getState, autoRefresh, updateAutoRefresh, applicationState, editingState, startEditState, saveEditState, cancelEditState}) =>
    <Main>
      <h1>flipstate dev tool</h1>
      <div>
        <Button onClick={backAddress}>⇦</Button>
        <Button onClick={forwardAddress}>⇨</Button>
        <AddressBarInput type="text" value={addressBarUrl} onChange={udpateAddressBarUrl}/>
        <Button onClick={gotoAddress}>Go</Button>
      </div>
      <h2>State</h2>
      <div>
        <Button onClick={getState} disabled={autoRefresh || editingState}>{autoRefresh} {editingState}Refresh</Button>
        <label>
          <Checkbox type="checkbox" checked={autoRefresh} onChange={updateAutoRefresh} disabled={editingState}/> <LabelText disabled={editingState}>auto</LabelText>
        </label>
      </div>
      <div>
        {!editingState && <Button onClick={startEditState}>Edit</Button>}
        {editingState && <Button onClick={saveEditState}>Save</Button>}
        {editingState && <Button onClick={cancelEditState}>Cancel</Button>}
      </div>
      <State/>
      <View id="application" src={applicationUrl}></View>
    </Main>
  }</DevToolState>

render(<StateProvider>
  <DevTool/>
</StateProvider>, document.body)

window.addEventListener('message', DevToolState.value.applicationMessage, false)
