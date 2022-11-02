import React, { useState, useEffect } from 'react'
import { useInfiniteQuery, RefetchQueryFilters } from 'react-query'
import axios from 'axios'
import { storage } from '../utils'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import { InfiniteScroll, List, Image, SwipeAction, Loading, ErrorBlock, Space, Search, NavBar, TabBar } from 'antd-mobile'
import { Action, SwipeActionRef } from 'antd-mobile/es/components/swipe-action'
import { UnorderedListOutline, ShopbagOutline, AddCircleOutline, SearchOutline, AddSquareOutline, UserSetOutline } from 'antd-mobile-icons'
function BasicQuery() {

  const history = useHistory();
  const url = storage.getUrl();
  let getToken = storage.getToken();
  if (!getToken) {
    history.push("/");
  }
  const [searchTitle, setSearchTitle] = useState("");
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // console.log('отправить ' + searchTitle);
      if (searchTitle) {
        history.push("/search/" + searchTitle);
      }
    }, 1500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTitle])

  const onChangeSearchTitle = (e: any) => {
    console.log(e);

    setSearchTitle(e);

  };
  const setRouteActive = (value: string) => {
    if ('logout' === value) {
      localStorage.removeItem('token');
      localStorage.removeItem('login');
      localStorage.removeItem('phone');

      history.push("/");
      return;
    }
    console.log(value);
    history.push(value)
  }
  const fetchProducts = ({ pageParam = 1 }) =>
    axios.get(
      `https://${url}/wp-json/wc/v3/products?page=${pageParam}&` + new URLSearchParams(getToken)
    )
  const parseLinkHeader = (linkHeader: any) => {
    const linkHeadersArray = linkHeader
      .split(', ')
      .map((header: any) => header.split('; '))
    const linkHeadersMap = linkHeadersArray.map((header: any) => {
      const thisHeaderRel = header[1].replace(/"/g, '').replace('rel=', '')
      const thisHeaderUrl = header[0].slice(1, -1)
      return [thisHeaderRel, thisHeaderUrl]
    })
    return Object.fromEntries(linkHeadersMap)
  }
  const rightActions: Action[] = [
    {
      key: 'unsubscribe',
      text: 'в наличии',
      color: 'success',
    },
    {
      key: 'mute',
      text: 'нет в наличии',
      color: 'warning',
    },
    {
      key: 'delete',
      text: 'удалить',
      color: 'danger',
    },
  ]
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery('infiniteProducts', fetchProducts, {
    getNextPageParam: (lastPage) => {
      const nextPageUrl = parseLinkHeader(lastPage.headers.link)['next']
      if (nextPageUrl) {
        const queryString = nextPageUrl.substring(
          nextPageUrl.indexOf('?'),
          nextPageUrl.length
        )
        const urlParams = new URLSearchParams(queryString)
        const nextPage = urlParams.get('page')
        return nextPage
      } else {
        return undefined
      }
    }
  })
  let productList
  const linkCreateVariable = (id: string) => {
    history.push("/variable/" + id);
  }
  if(error){
 
  }
  if (data) {
    productList = data.pages.map((page: any, index) => (
      <React.Fragment key={index}>
        {page.data.map((product: any) => (
          <SwipeAction
            key={product.ID}
            rightActions={rightActions}
          >

            <List.Item key={product.ID} description={product.price}
              prefix={
                <Link
                  to={`/products/${product.id}`}
                >
                  <Image
                    src={product.images ? product.images[0]?.src : '/404'}
                    width={100}
                    height={100}
                    fit='contain'
                    style={{ borderRadius: 8 }}
                  />  </Link>}
              extra={<AddSquareOutline onClick={() => linkCreateVariable(product.id)} />}
            >
              <Link
                to={`/products/${product.id}`}
              >   {product.name}
              </Link>
            </List.Item>
          </SwipeAction>
        ))}
      </React.Fragment>
    ))
  }
  const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
    return (
      <>
        {hasMore ? (
          <>
            <span>Загрузка</span>
            <Loading />
          </>
        ) : (
          <Space block direction='vertical'>
            <ErrorBlock fullPage description='Подождите' title='Получаем данные' status='busy' />
          </Space>
        )}
      </>
    )
  }
  const right = (
    <div style={{ fontSize: 18 }}>
      <Space>
        <SearchOutline />
      </Space>
    </div>
  )
  const tabs = [
    {
      key: '/products',
      title: 'Продукты',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/create',
      title: 'Создать',
      icon: <AddCircleOutline />,
    },
    {
      key: '/orders',
      title: 'Заказы',
      icon: <ShopbagOutline />,
      badge: '5',
    },
    {
      key: 'logout',
      title: 'Выйти',
      icon: <UserSetOutline />,
      badge: '5',
    },

  ]
  return (
    <div>
      <div style={{ height: '92vh', overflow: 'auto', paddingBottom: "20px" }}>

        <NavBar right={right} back={null}>
          Продукты
        </NavBar>
        <Space direction='vertical' block>
          <Search placeholder='Введите название товара' onChange={(e) => onChangeSearchTitle(e)} />
        </Space>
        {status === 'success' && <List>{productList}</List>}

        <InfiniteScroll
          // @ts-ignore
          loadMore={fetchNextPage}
          // @ts-ignore 
          hasMore={hasNextPage} >
          <InfiniteScrollContent hasMore={hasNextPage} />
        </InfiniteScroll>
      </div>
      <TabBar style={{ position: "fixed", bottom: 0, zIndex: 99, width: "100%", background: "#fff", maxWidth: "750px" }} onChange={value => setRouteActive(value)} >
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div >
  )
}

export default BasicQuery