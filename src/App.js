import './App.css'
import { HashRouter, Routes , Route} from 'react-router-dom'
import {ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import Home from './home.js'
import Login from './login.js'
function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/home" element={<Home/>} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  )
}
export default App