import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import './router/permission'

import 'element-plus/dist/index.css'
import '@/assets/styles/main.scss'

import {
    ArrowDown,
    Bell,
    Box,
    Checked,
    Clock,
    Close,
    CloseBold,
    Collection,
    CopyDocument,
    DataLine,
    Delete,
    Document,
    DocumentChecked,
    Download,
    Edit,
    EditPen,
    Expand,
    Files,
    Fold,
    FolderOpened,
    Key,
    List,
    Lock,
    Medal,
    Monitor,
    Notebook,
    Odometer,
    Plus,
    Reading,
    Refresh,
    Search,
    Select,
    SwitchButton,
    Timer,
    TrendCharts,
    User,
    UserFilled,
    View,
    Warning
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { setAuthExpiredHandler } from '@/utils/auth'

const app = createApp(App)
const pinia = createPinia()
const globalIcons = {
    ArrowDown,
    Bell,
    Box,
    Checked,
    Clock,
    Close,
    CloseBold,
    Collection,
    CopyDocument,
    DataLine,
    Delete,
    Document,
    DocumentChecked,
    Download,
    Edit,
    EditPen,
    Expand,
    Files,
    Fold,
    FolderOpened,
    Key,
    List,
    Lock,
    Medal,
    Monitor,
    Notebook,
    Odometer,
    Plus,
    Reading,
    Refresh,
    Search,
    Select,
    SwitchButton,
    Timer,
    TrendCharts,
    User,
    UserFilled,
    View,
    Warning
}

Object.entries(globalIcons).forEach(([key, component]) => {
    app.component(key, component)
})

pinia.use(piniaPluginPersistedstate)

const userStore = useUserStore(pinia)
setAuthExpiredHandler(() => userStore.clearUserState())

app.use(pinia)
app.use(router)

app.mount('#app')
