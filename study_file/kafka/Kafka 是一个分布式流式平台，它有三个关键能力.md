## Kafka 是一个分布式流式平台，它有三个关键能力

1. 订阅发布记录流，它类似于企业中的`消息队列` 或 `企业消息传递系统`
2. 以容错的方式存储记录流
3. 实时记录流

### Kafka 的应用

1. 作为消息系统
2. 作为存储系统
3. 作为流处理器

Kafka 可以建立流数据管道，可靠性的在系统或应用之间获取数据。

建立流式应用传输和响应数据

### Kafka 作为消息系统

Kafka 作为消息系统，它有三个基本组件

![图片](/images/kafka_1_1.jpg)

Producer : 发布消息的客户端

- Broker：一个从生产者接受并存储消息的客户端
- Consumer : 消费者从 Broker 中读取消息

在大型系统中，会需要和很多子系统做交互，也需要消息传递，在诸如此类系统中，你会找到源系统（消息发送方）和 目的系统（消息接收方）。为了在这样的消息系统中传输数据，你需要有合适的数据管道

![图片](/images/kafka_1_2.jpg)

这种数据的交互看起来就很混乱，如果我们使用消息传递系统，那么系统就会变得更加简单和整洁

![图片](/images/kafka_1_3.jpg)

Kafka 运行在一个或多个数据中心的服务器上作为集群运行

- Kafka 集群存储消息记录的目录被称为 `topics`
- 每一条消息记录包含三个要素：**键（key）、值（value）、时间戳（Timestamp）**

### 核心 API

Kafka 有四个核心API，它们分别是

- Producer API，它允许应用程序向一个或多个 topics 上发送消息记录
- Consumer API，允许应用程序订阅一个或多个 topics 并处理为其生成的记录流
- Streams API，它允许应用程序作为流处理器，从一个或多个主题中消费输入流并为其生成输出流，有效的将输入流转换为输出流。
- Connector API，它允许构建和运行将 Kafka 主题连接到现有应用程序或数据系统的可用生产者和消费者。例如，关系数据库的连接器可能会捕获对表的所有更改

![图片](/images/kafka_1_4.jpg)

## 2. Kafka 基本概念

Kafka 作为一个高度可扩展可容错的消息系统，它有很多基本概念，下面就来认识一下这些 Kafka 专属的概念

### topic

Topic 被称为主题，在 kafka 中，使用一个类别属性来划分消息的所属类，划分消息的这个类称为 topic。topic 相当于消息的分配标签，是一个逻辑概念。主题好比是数据库的表，或者文件系统中的文件夹。

### partition

partition 译为分区，topic 中的消息被分割为一个或多个的 partition，它是一个物理概念，对应到系统上的就是一个或若干个目录，一个分区就是一个 `提交日志`。消息以追加的形式写入分区，先后以顺序的方式读取。

![图片](/images/kafka_1_5.jpg)

> 注意：由于一个主题包含无数个分区，因此无法保证在整个 topic 中有序，但是单个 Partition 分区可以保证有序。消息被迫加写入每个分区的尾部。Kafka 通过分区来实现数据冗余和伸缩性

分区可以分布在不同的服务器上，也就是说，一个主题可以跨越多个服务器，以此来提供比单个服务器更强大的性能。

### segment

Segment 被译为段，将 Partition 进一步细分为若干个 segment，每个 segment 文件的大小相等。

### broker

Kafka 集群包含一个或多个服务器，每个 Kafka 中服务器被称为 broker。broker 接收来自生产者的消息，为消息设置偏移量，并提交消息到磁盘保存。broker 为消费者提供服务，对读取分区的请求作出响应，返回已经提交到磁盘上的消息。

broker 是集群的组成部分，每个集群中都会有一个 broker 同时充当了 `集群控制器(Leader)`的角色，它是由集群中的活跃成员选举出来的。

每个集群中的成员都有可能充当 Leader，Leader 负责管理工作，包括将分区分配给 broker 和监控 broker。

集群中，一个分区从属于一个 Leader，但是一个分区可以分配给多个 broker（非Leader），这时候会发生分区复制。这种复制的机制为分区提供了消息冗余，如果一个 broker 失效，那么其他活跃用户会重新选举一个 Leader 接管。

![图片](/images/kafka_1_6.jpg)

### producer

生产者，即消息的发布者，其会将某 topic 的消息发布到相应的 partition 中。生产者在默认情况下把消息均衡地分布到主题的所有分区上，而并不关心特定消息会被写到哪个分区。不过，在某些情况下，生产者会把消息直接写到指定的分区。

### consumer

消费者，即消息的使用者，一个消费者可以消费多个 topic 的消息，对于某一个 topic 的消息，其只会消费同一个 partition 中的消息

![图片](/images/kafka_1_7.jpg)

在了解完 Kafka 的基本概念之后，我们通过搭建 Kafka 集群来进一步深刻认识一下 Kafka。



## 3. 确保安装环境

### 安装 Java 环境

在安装 Kafka 之前，先确保Linux 环境上是否有 Java 环境，使用 `java -version` 命令查看 Java 版本，推荐使用Jdk 1.8 ，如果没有安装 Java 环境的话，可以按照这篇文章进行安装（https://www.cnblogs.com/zs-notes/p/8535275.html）

### 安装 Zookeeper 环境

Kafka 的底层使用 Zookeeper 储存元数据，确保一致性，所以安装 Kafka 前需要先安装 Zookeeper，Kafka 的发行版自带了 Zookeeper ，可以直接使用脚本来启动，不过安装一个 Zookeeper 也不费劲

#### Zookeeper 集群搭建

#### 准备条件(docker版)

```
sudo systemctl start docker
```

### 1. 创建 Docker 网络

为了让 Zookeeper 容器之间能够相互通信，您需要创建一个 Docker 网络：

```
sudo docker network create zookeeper-net
```

c98e6a7f82eede3f80dbcaea12d6ffb98f17c3fa6738fc21d1972dde45c7b3b2

### 2. 拉取 Zookeeper 镜像

拉取官方的 Zookeeper Docker 镜像：

```
sudo docker pull zookeeper:3.7.0
```

### 3. 创建并运行 Zookeeper 容器

创建三个 Zookeeper 容器，并为每个容器分配 1GB 内存：

#### 创建第一个 Zookeeper 容器

```
docker run -p 2182:2181 -d --name zookeeper1 --hostname zookeeper1 --network zookeeper-net --memory 1g \
-v /usr/local/zookeeper1/data:/data \
-v /usr/local/zookeeper1/log:/datalog \
-e ZOO_MY_ID=1 \
-e ZOO_SERVERS="server.1=zookeeper1:2888:3888;2181 server.2=zookeeper2:2888:3888;2181 server.3=zookeeper3:2888:3888;2181" \
zookeeper:3.7.0
```

#### 创建第二个 Zookeeper 容器

```bash
docker run -p 2183:2181 -d --name zookeeper2 --hostname zookeeper2 --network zookeeper-net --memory 1g \
-v /usr/local/zookeeper2/data:/data \
-v /usr/local/zookeeper2/log:/datalog \
-e ZOO_MY_ID=2 \
-e ZOO_SERVERS="server.1=zookeeper1:2888:3888;2181 server.2=zookeeper2:2888:3888;2181 server.3=zookeeper3:2888:3888;2181" \
zookeeper:3.7.0
```

#### 创建第三个 Zookeeper 容器

```bash
docker run -p 2184:2181 -d --name zookeeper3 --hostname zookeeper3 --network zookeeper-net --memory 1g \
-v /usr/local/zookeeper3/data:/data \
-v /usr/local/zookeeper3/log:/datalog \
-e ZOO_MY_ID=3 \
-e ZOO_SERVERS="server.1=zookeeper1:2888:3888;2181 server.2=zookeeper2:2888:3888;2181 server.3=zookeeper3:2888:3888;2181" \
zookeeper:3.7.0
```

### 解释

- `--name zookeeper1`：容器的名称。
- `--network zookeeper-net`：使用之前创建的 Docker 网络。
- `--memory 1g`：为容器分配 1GB 内存。
- `-v /usr/local/zookeeper1/data:/data`：将主机上的目录挂载到容器内的 `/data` 目录。
- `-v /usr/local/zookeeper1/log:/datalog`：将主机上的目录挂载到容器内的 `/datalog` 目录。
- `-e ZOO_MY_ID=1`：设置 Zookeeper 节点的 ID。
- `-e ZOO_SERVERS="server.1=zookeeper1:2888:3888 server.2=zookeeper2:2888:3888 server.3=zookeeper3:2888:3888"`：配置 Zookeeper 集群的服务器列表。

Zookeeper 集群（也称为 Zookeeper Ensemble）通常由多个 Zookeeper 实例组成，这些实例协同工作以提供高可用性和一致性。集群中的每个实例需要知道其他实例的地址和端口，以便相互通信。

`ZOO_SERVERS` 环境变量用于配置 Zookeeper 集群中的所有节点及其通信端口。格式如下：

```
server.X=hostname:port1:port2
```

- `server.X`：Zookeeper 节点的标识符，其中 `X` 是节点的 ID。
- `hostname`：Zookeeper 节点的主机名或 IP 地址。
- `port1`：用于 Zookeeper 节点之间的选举通信端口。
- `port2`：用于 Zookeeper 节点之间的同步通信端口。

### 详细解释

```
-e ZOO_SERVERS="server.1=zookeeper1:2888:3888 server.2=zookeeper2:2888:3888 server.3=zookeeper3:2888:3888"
```

- `server.1=zookeeper1:2888:3888`：
  - `server.1`：第一个 Zookeeper 节点，ID 为 1。
  - `zookeeper1`：第一个 Zookeeper 节点的主机名。
  - `2888`：用于 Zookeeper 节点之间的选举通信端口。
  - `3888`：用于 Zookeeper 节点之间的同步通信端口。
- `server.2=zookeeper2:2888:3888`：
  - `server.2`：第二个 Zookeeper 节点，ID 为 2。
  - `zookeeper2`：第二个 Zookeeper 节点的主机名。
  - `2888`：用于 Zookeeper 节点之间的选举通信端口。
  - `3888`：用于 Zookeeper 节点之间的同步通信端口。
- `server.3=zookeeper3:2888:3888`：
  - `server.3`：第三个 Zookeeper 节点，ID 为 3。
  - `zookeeper3`：第三个 Zookeeper 节点的主机名。
  - `2888`：用于 Zookeeper 节点之间的选举通信端口。
  - `3888`：用于 Zookeeper 节点之间的同步通信端口。

### 为什么端口相同

在 Zookeeper 集群中，所有节点使用相同的端口号进行通信，以简化配置和管理。具体来说：

- **选举通信端口（2888）**：用于 Zookeeper 节点之间的领导者选举通信。当集群中的节点需要选举新的领导者时，会通过这个端口进行通信。
- **同步通信端口（3888）**：用于 Zookeeper 节点之间的数据同步通信。当领导者节点需要将数据同步到其他跟随者节点时，会通过这个端口进行通信。

尽管端口号相同，但每个节点在不同的主机上运行，因此不会发生端口冲突。

### Docker 网络和容器名称解析

1. **自定义 Docker 网络**：
   - 当您使用 `docker network create zookeeper-net` 创建一个自定义网络时，Docker 会为该网络启用内置的 DNS 服务。这允许在同一网络中的容器通过名称相互解析和通信。
2. **容器名称解析**：
   - 在自定义网络中启动的容器可以通过容器名称相互解析。这意味着，如果您在 `zookeeper-net` 网络中启动一个名为 `zookeeper1` 的容器，其他在同一网络中的容器可以通过 `zookeeper1` 这个名称与其通信。
3. **网络生效时间**：
   - 自定义网络在创建时立即生效。当您在该网络中启动容器时，这些容器将自动加入该网络，并可以通过名称进行解析和通信。

### 验证网络和名称解析

您可以使用 `docker exec` 命令在容器内验证名称解析：

```bash
docker exec -it zookeeper1 /bin/bash
apt-get update
apt-get install -y iputils-ping

docker exec -it zookeeper1 ping zookeeper2
docker exec -it zookeeper1 ping zookeeper3
```

通过这些命令，您可以验证 `zookeeper1` 容器是否能够解析并访问 `zookeeper2` 和 `zookeeper3` 容器。

[docker换镜像](https://blog.csdn.net/qq_44866828/article/details/139745845)

### 4. 验证 Zookeeper 集群

您可以使用以下命令来检查 Zookeeper 容器的状态：

```bash
docker ps
```

输出示例：

```plaintext
CONTAINER ID   IMAGE            COMMAND                  CREATED         STATUS         PORTS                                       NAMES
d4f5a1e2e5f4   zookeeper:3.4.10 "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   2181/tcp, 2888/tcp, 3888/tcp                zookeeper3
b3c5a1e2e5f4   zookeeper:3.4.10 "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   2181/tcp, 2888/tcp, 3888/tcp                zookeeper2
a4f5a1e2e5f4   zookeeper:3.4.10 "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   2181/tcp, 2888/tcp, 3888/tcp                zookeeper1
```

### 5. 连接到 Zookeeper 容器

您可以使用 `docker exec` 命令连接到 Zookeeper 容器，并执行 Zookeeper 命令：

```bash
docker exec -it zookeeper1 /bin/bash
```

在容器内，您可以使用 `zkCli.sh` 命令连接到 Zookeeper：

```bash
zkCli.sh -server zookeeper1:2181
```

## 4.Kafka 集群搭建

> 准备条件

* 搭建好的 Zookeeper 集群

* Kafka 压缩包 （https://www.apache.org/dyn/closer.cgi?path=/kafka/2.3.0/kafka_2.12-2.3.0.tgz）

把下载完成的 tar.gz 包移到 /usr/local/ 目录下，使用 tar -zxvf 压缩包 进行解压，解压完成后，重命名 `kafka_2.12-2.3.0` 为 `kafka`， 进入到 `kafka` 目录下，新建 logs 文件夹，进入到 config 目录下

我们可以看到有很多 properties 配置文件，这里主要关注 `server.properties` 这个文件即可。

kafka 启动方式有两种，一种是使用 kafka 自带的 zookeeper 配置文件来启动（可以按照官网来进行启动，并使用单个服务多个节点来模拟集群http://kafka.apache.org/quickstart#quickstart_multibroker），一种是通过使用独立的zk集群来启动，这里推荐使用第二种方式，使用 zk 集群来启动

> 修改配置项

需要为每个服务都修改一下配置项，也就是server.properties， 需要更新和添加的内容有

```
broker.id=0 //初始是0，每个 server 的broker.id 都应该设置为不一样的，就和 myid 一样 我的三个服务分别设置的是 1,2,3
log.dirs=/usr/local/kafka/logs

#在log.retention.hours=168 下面新增下面三项
message.max.byte=5242880
default.replication.factor=2
replica.fetch.max.bytes=5242880

#设置zookeeper的连接端口
zookeeper.connect=127.0.0.1:2182,127.0.0.1:2183,127.0.0.1:2184
```

由于zookeeper是由容器实现的，如果要找容器的ip，但由于kafka不是容器实现所以要用主机映射地址
```
docker ps
获取容器CONTAINER ID
27e8a40861c7
0afdde8ce38a
354b36f4c835

docker inspect 27e8a40861c7 | grep -i ip
172.19.0.4
docker inspect 0afdde8ce38a | grep -i ip
172.19.0.3
docker inspect 354b36f4c835 | grep -i ip
172.19.0.2
```

配置项的含义

```
broker.id=0  #当前机器在集群中的唯一标识，和zookeeper的myid性质一样
port=9092 #当前kafka对外提供服务的端口默认是9092
host.name=192.168.1.7 #这个参数默认是关闭的，在0.8.1有个bug，DNS解析问题，失败率的问题。
num.network.threads=3 #这个是borker进行网络处理的线程数
num.io.threads=8 #这个是borker进行I/O处理的线程数
log.dirs=/usr/local/kafka/logs #消息存放的目录，这个目录可以配置为“，”逗号分割的表达式，上面的num.io.threads要大于这个目录的个数这个目录，如果配置多个目录，新创建的topic他把消息持久化的地方是，当前以逗号分割的目录中，那个分区数最少就放那一个
socket.send.buffer.bytes=102400 #发送缓冲区buffer大小，数据不是一下子就发送的，先回存储到缓冲区了到达一定的大小后在发送，能提高性能
socket.receive.buffer.bytes=102400 #kafka接收缓冲区大小，当数据到达一定大小后在序列化到磁盘
socket.request.max.bytes=104857600 #这个参数是向kafka请求消息或者向kafka发送消息的请请求的最大数，这个值不能超过java的堆栈大小
num.partitions=1 #默认的分区数，一个topic默认1个分区数
log.retention.hours=168 #默认消息的最大持久化时间，168小时，7天
message.max.byte=5242880  #消息保存的最大值5M
default.replication.factor=2  #kafka保存消息的副本数，如果一个副本失效了，另一个还可以继续提供服务
replica.fetch.max.bytes=5242880  #取消息的最大直接数
log.segment.bytes=1073741824 #这个参数是：因为kafka的消息是以追加的形式落地到文件，当超过这个值的时候，kafka会新起一个文件
log.retention.check.interval.ms=300000 #每隔300000毫秒去检查上面配置的log失效时间（log.retention.hours=168 ），到目录查看是否有过期的消息如果有，删除
log.cleaner.enable=false #是否启用log压缩，一般不用启用，启用的话可以提高性能
zookeeper.connect=127.0.0.1:2182,127.0.0.1:2183,127.0.0.1:2184 #设置zookeeper的连接端口
```

> 启动 Kafka 集群并测试

* 启动服务，进入到 /usr/local/kafka/bin 目录下

```
# 启动后台进程
./kafka-server-start.sh -daemon ../config/server.properties
```

* 检查服务是否启动

```
sudo yum install java-1.8.0-openjdk-devel (如果/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.262.b10-0.el7_8.x86_64 下面没有jps)
# 执行命令 jps
6972 Kafka
```

* kafka 已经启动

* 创建 Topic 来验证是否创建成功

```
# cd .. 往回退一层 到 /usr/local/kafka 目录下
./kafka-topics.sh --create --zookeeper 127.0.0.1:2182 --replication-factor 2 --partitions 1 --topic test

## 在较新版本的Kafka（2.2.0及以后版本）中，kafka-topics.sh 脚本不再使用 --zookeeper 选项来指定Zookeeper的地址，而是改为使用 --bootstrap-server 选项来指定Kafka broker的地址。
## 查看版本
./kafka-topics.sh --version

## Kafka broker的实际地址和端口
cat ../config/server.properties | grep "listeners"

./kafka-topics.sh --create --bootstrap-server 127.0.0.1:9092 --replication-factor 1 --partitions 1 --topic test
```

对上面的解释

```
--replication-factor 1   复制一份，因为只有一个broker

--partitions 1 创建1个分区

--topic 创建主题
```

> 查看所有的主题：

```
./kafka-topics.sh --list --bootstrap-server 127.0.0.1:9092
```

> 查看特定主题的详细信息：

```
./kafka-topics.sh --describe --bootstrap-server 127.0.0.1:9092 --topic test
```

> 向主题发布消息：

```
./kafka-console-producer.sh --broker-list 127.0.0.1:9092 --topic test
```

> 从主题消费消息

```
./kafka-console-consumer.sh --bootstrap-server 127.0.0.1:9092 --topic test --from-beginning
```
这个命令会显示 test 主题中的所有消息，包括已经发布的消息和新发布的消息。如果你只想看到新发布的消息，可以去掉 --from-beginning 参数。

问题: **`[2024-07-11 14:29:26,166]` WARN [AdminClient clientId=adminclient-1] Connection to node -1 (/47.120.xx.xx:9092) could not be established. Node may not be available. (org.apache.kafka.clients.NetworkClient)**

```
netstat -tuln | grep 端口号

telnet 47.120.xx.xx 9092

telnet: connect to address 127.0.0.1: Connection refused
```

防火墙允许端口

```
sudo firewall-cmd --zone=public --add-port=9092/tcp --permanent
sudo firewall-cmd --reload
```


## 参考文章

[带你涨姿势的认识一下kafka](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247496058&idx=1&sn=f3265299d90fde9dd9a4f4afe88411f8&source=41#wechat_redirect)