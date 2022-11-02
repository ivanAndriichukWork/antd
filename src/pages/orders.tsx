import React, { useState, useEffect } from 'react'
import { useInfiniteQuery, RefetchQueryFilters } from 'react-query'
import axios from 'axios'
import { storage } from '../utils'
import { Link } from 'react-router-dom'
import { InfiniteScroll, List, Image, SwipeAction, Loading, ErrorBlock, Space, Search, NavBar, TabBar } from 'antd-mobile'
import { Action, SwipeActionRef } from 'antd-mobile/es/components/swipe-action'
import { UnorderedListOutline, ShopbagOutline, SearchOutline, AddCircleOutline } from 'antd-mobile-icons'
import { useHistory } from 'react-router-dom'
function OrdersQuery() {

  let history = useHistory();
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
    history.push(value)
  }
  const fetchProducts = ({ pageParam = 1 }) =>
    axios.get(
      `https://${url}/wp-json/wc/v3/orders?page=${pageParam}&` + new URLSearchParams(getToken)
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

  if (data) {
    console.log(data);
    productList = data.pages.map((page: any, index) => (
      <React.Fragment key={index}>
        {page.data.map((order: any) => (
          <SwipeAction
            key={order.ID}
            rightActions={rightActions}
          >
            <Link
              to={`/orders/${order.id}`}
            >
              <List.Item key={order.ID} title={order.status} description={order.total + ' ' + order.currency_symbol}

              >
                {'Дата заказа ' + order.date_created}
                <br />
                {'#' + order.number}

              </List.Item>
            </Link>
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
      key: '/orders',
      title: 'Orders',
      icon: <ShopbagOutline />,
      badge: '5',
    },
    {
      key: '/create',
      title: 'Создать',
      icon: <AddCircleOutline />,
    },
    {
      key: '/products',
      title: 'Products',
      icon: <UnorderedListOutline />,
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

export default OrdersQuery