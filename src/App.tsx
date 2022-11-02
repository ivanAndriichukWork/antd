import { useState } from 'react'
import { Auth } from './pages/auth'
import { Route, Switch, Redirect } from 'react-router-dom'
import BasicQuery from './pages/products'
import { storage } from './utils';
import EditProduct from './pages/editProduct';
import AddCatProduct from './pages/catProduct';
import OrdersQuery from './pages/orders';
import SearchQuery from './pages/search';
import AddProduct from './pages/addProduct';
import AddVariable from './pages/addVariable';
import ListVariable from './pages/listVariable';
function App() {
  const token = storage.getToken();
  const [count, setCount] = useState(0)

  return (

    <Switch>
      <Route path="/" exact>
        {token ? <Redirect to="/products" /> : <Auth />}
      </Route>
      <Route path="/variable/:id/list">
        <ListVariable />
      </Route>
      <Route path="/variable/:id">
        <AddVariable />
      </Route>
      <Route path="/products/:id/categories">
        <AddCatProduct />
      </Route>
      <Route path="/products/:id">
        <EditProduct />
      </Route>
      <Route path="/products">
        <BasicQuery />
      </Route>
      <Route path="/search/:search">
        <SearchQuery />
      </Route>
      <Route path="/orders">
        <OrdersQuery />
      </Route>
      <Route path="/create">
        <AddProduct />
      </Route>
    </Switch>
  )
}

export default App
