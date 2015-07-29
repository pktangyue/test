MongoProfilerAPI
========

实现一组 Restful API，读取 Mongodb profile，计算一年内每天，每周，每月的平均响应时间并返回 JSON 格式数据。

运行环境
---------
程序 | 版本号
--- | ---
nvm	| 0.25.4
node | 0.12.7
npm | 2.12.1
mongodb | 3.0.4

开始运行
-------
首先需要安装依赖包：

	npm install

同时确保 `mongodb` 服务已开启。
	
运行命令：

	node app.js
	
打开浏览器，输入 `http://127.0.0.1:3000/api/`，查看可使用的 API。

API 介绍
--------
### 获取一年内每天的平均响应时间

    GET /api/avgtime/:year/perday{?date,limit}

#### 参数

- :year

  指定获取哪一年的数据，必须是个正整数
  
- date

  可选参数，返回某一天的数据。格式为`MMDD`，并且是个合法的日期
  
- limit

  可选参数，只返回 limit 条数据，必须是个正整数

#### 返回结果

```javascript
[ 
  { date: '2015-07-26', avgtime: 1.4 },
  { date: '2015-07-25', avgtime: 1.5448504983388704 },
  { date: '2015-07-23', avgtime: 0.07119741100323625 },
  { date: '2015-07-22', avgtime: 0 },
  { date: '2015-07-21', avgtime: 0 } 
]
```
如果某天没有数据，则不包含在数组里面。
  
### 获取一年内每周的平均响应时间

    GET /api/avgtime/:year/perweek{?date,week,limit} 
  
#### 参数

- :year

  指定获取哪一年的数据，必须是个正整数
  
- date

  可选参数，返回某一天所在的那一周的数据。格式为`MMDD`，并且是个合法的日期
  
- week

  可选参数，返回一年内第几周的数据，必须是个正整数
  
- limit

  可选参数，只返回 limit 条数据，必须是个正整数
  
#### 返回结果

```javascript
[ 
  { avgtime: 1.4, week: 31 },
  { avgtime: 0.7562111801242236, week: 30 }
]
```
如果某周没有数据，则不包含在数组里面。
  
### 获取一年内每月的平均响应时间

    GET /api/avgtime/:year/permonth{?month,limit} 
  
#### 参数

- :year

  指定获取哪一年的数据，必须是个正整数
  
- month

  可选参数，返回一年内第几个月的数据，必须是个正整数
  
- limit

  可选参数，只返回 limit 条数据，必须是个正整数

#### 返回结果

```javascript
[ 
  { avgtime: 0.7660550458715596, month: 7 }
]
```
如果某个月没有数据，则不包含在数组里面。

测试
-------
运行以下命令进行测试

    make test
  
运行以下命令，查看代码测试覆盖率

    make cov
