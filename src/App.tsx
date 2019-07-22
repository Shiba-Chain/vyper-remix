import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import { VyperCompilationOutput, remixClient } from './utils'
import { CompilationResult } from '@remixproject/plugin'

// Components
import CompilerButton from './components/CompilerButton'
import VyperResult from './components/VyperResult'
import LocalUrlInput from './components/LocalUrl';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'

import vyperLogo from './logo.svg'
import './App.css'


interface AppState {
  status: 'idle' | 'inProgress'
  environment: 'remote' | 'local'
  compilationResult?: CompilationResult,
  localUrl: string
}

interface OutputMap {
  [fileName: string]: VyperCompilationOutput
}

const App: React.FC = () => {
  const [contract, setContract] = useState<string>()
  const [output, setOutput] = useState<OutputMap>({})
  const [state, setState] = useState<AppState>({
    status: 'idle',
    environment: 'remote',
    localUrl: 'http://localhost:8000/compile',
  })

  useEffect(() => {
    async function start() {
      await remixClient.loaded()
      remixClient.onFileChange(name => setContract(name))
      const name = await remixClient.getContractName()
      setContract(name)
    }
    start()
  }, [])

  /** Update the environment state value */
  function setEnvironment(environment: 'local' | 'remote') {
    setState({ ...state, environment });
  }

  function setLocalUrl(url: string) {
    setState({ ...state, localUrl: url });
  }

  function compilerUrl() {
    return state.environment === 'remote'
      ? 'https://vyper.live/compile'
      : state.localUrl;
  }

  return (
    // <RemixClientContext.Provider value={remixClient}>
      <main id="vyper-plugin">
        <header className="bg-light">
          <div className="title">
            <img src={vyperLogo} alt="Vyper logo" />
            <h4>yper Compiler</h4>
          </div>
          <a rel="noopener noreferrer" href="https://github.com/GrandSchtroumpf/vyper-remix" target="_blank" >
            <FontAwesomeIcon icon={faGithub}/>
          </a>
        </header>
        <section>
          <ToggleButtonGroup name="remote" onChange={setEnvironment} type="radio" value={state.environment}>
            <ToggleButton variant="secondary" name="remote" value="remote">
              Remote Compiler
            </ToggleButton>
            <ToggleButton variant="secondary" name="local" value="local">
              Local Compiler
            </ToggleButton>
          </ToggleButtonGroup>
          <LocalUrlInput
            url={state.localUrl}
            setUrl={setLocalUrl}
            environment={state.environment}/>
          <div id="compile-btn">
            <CompilerButton
              compilerUrl={compilerUrl()}
              contract={contract}
              setOutput={(name, update) => setOutput({...output, [name]: update})}/>
          </div>
          <article id="result">
            <VyperResult output={contract ? output[contract] : undefined} />
          </article>
        </section>
      </main>
    // </RemixClientContext.Provider>
  )
}

export default App