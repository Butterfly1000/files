# 安装并配置Kafka Broker

这里将kafka和zookeeper部署在一起了。

## 1、下载与安装Kafka

kafka官网https://kafka.apache.org/downloads

![image-20240603142242578](/Users/huangyanyu/Library/Application Support/typora-user-images/image-20240603142242578.png)

这里推荐的版本是2.13

```
wget https://downloads.apache.org/kafka/3.7.0/kafka_2.13-3.7.0.tgz
tar xf kafka_2.13-3.7.0.tgz -C /usr/local/
mv /usr/local/kafka_2.13-3.7.0 /usr/local/kafka
#新建存放日志和数据的文件夹
mkdir /usr/local/kafka/logs
```

## 2、配置kafka

这里将kafka安装到/usr/local目录下

因此，kafka的主配置文件为/usr/local/kafka/config/server.properties，这里以节点kafkazk1为例，重点介绍一些常用配置项的含义：

```
broker.id=1
listeners=PLAINTEXT://10.0.0.6:9092
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
log.dirs=/usr/local/kafka/logs
num.partitions=6
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connect=localhost:2181
#不是集群，所以可以写成localhost
#zookeeper.connect=10.0.0.6:2181,10.0.0.7:2181,10.0.0.8:2181
zookeeper.connection.timeout.ms=18000
group.initial.rebalance.delay.ms=0
auto.create.topics.enable=true
delete.topic.enable=true
```

每个配置项含义如下：

- `broker.id`：每一个broker在集群中的唯一表示，要求是正数。当该服务器的IP地址发生改变时，broker.id没有变化，则不会影响consumers的消息情况。

- `listeners`：设置kafka的监听地址与端口，可以将监听地址设置为主机名或IP地址，这里将监听地址设置为IP地址。

- `log.dirs`：这个参数用于配置kafka保存数据的位置，kafka中所有的消息都会存在这个目录下。可以通过逗号来指定多个路径， kafka会根据最少被使用的原则选择目录分配新的parition。需要注意的是，kafka在分配parition的时候选择的规则不是按照磁盘的空间大小来定的，而是根据分配的 parition的个数多小而定。

- `num.partitions`：这个参数用于设置新创建的topic有多少个分区，可以根据消费者实际情况配置，配置过小会影响消费性能。这里配置6个。

- `log.retention.hours`：这个参数用于配置kafka中消息保存的时间，还支持log.retention.minutes和 log.retention.ms配置项。这三个参数都会控制删除过期数据的时间，推荐使用log.retention.ms。如果多个同时设置，那么会选择最小的那个。

- `log.segment.bytes`：配置partition中每个segment数据文件的大小，默认是1GB，超过这个大小会自动创建一个新的segment file。

- ```
  zookeeper.connect
  ```

  ：这个参数用于指定zookeeper所在的地址，它存储了broker的元信息。 这个值可以通过逗号设置多个值，每个值的格式均为：hostname:port/path，每个部分的含义如下：

  - **hostname**：表示zookeeper服务器的主机名或者IP地址，这里设置为IP地址。
  - **port**： 表示是zookeeper服务器监听连接的端口号。
  - **/path**：表示kafka在zookeeper上的根目录。如果不设置，会使用根目录。

- `auto.create.topics.enable`：这个参数用于设置是否自动创建topic，如果请求一个topic时发现还没有创建， kafka会在broker上自动创建一个topic，如果需要严格的控制topic的创建，那么可以设置auto.create.topics.enable为false，禁止自动创建topic。

- `delete.topic.enable`：在0.8.2版本之后，Kafka提供了删除topic的功能，但是默认并不会直接将topic数据物理删除。如果要从物理上删除（即删除topic后，数据文件也会一同删除），就需要设置此配置项为true。

## 3、添加环境变量

```
$ vim /etc/profile 
export KAFKA_HOME=/usr/local/kafka 
export PATH=$PATH:$KAFKA_HOME/bin

#生效 
$ . /etc/profile
```

## 4、kafka启动脚本

```

$ vim /usr/lib/systemd/system/kafka.service
[Unit]
Description=Apache Kafka server (broker)
After=network.target  zookeeper.service

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties
ExecStop=/usr/local/kafka/bin/kafka-server-stop.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target

$ systemctl daemon-reload
```

## 5、启动kafka

在启动kafka集群前，需要确保ZooKeeper集群已经正常启动。接着，依次在kafka各个节点上执行如下命令即可：

```
$ cd /usr/local/kafka
$ nohup bin/kafka-server-start.sh config/server.properties &
# 或者
$ systemctl start kafka
$ jps
21840 Kafka
15593 Jps
15789 QuorumPeerMain
```

这里将kafka放到后台运行，启动后，会在启动kafka的当前目录下生成一个nohup.out文件，可通过此文件查看kafka的启动和运行状态。通过jps指令，可以看到有个Kafka标识，这是kafka进程成功启动的标志。



## 6、测试kafka基本命令操作

kefka提供了多个命令用于查看、创建、修改、删除topic信息，也可以通过命令测试如何生产消息、消费消息等，这些命令位于kafka安装目录的bin目录下，这里是**/usr/local/kafka/bin**。

登录任意一台kafka集群节点，切换到此目录下，即可进行命令操作。

下面列举kafka的一些常用命令的使用方法。

（1）显示topic列表

```
#kafka-topics.sh  --zookeeper 10.0.0.6:2181,10.0.0.7:2181,10.0.0.8:2181 --list
$ kafka-topics.sh  --zookeeper 10.0.0.6:2181 --list
topic123
```

（2）创建一个topic，并指定topic属性（副本数、分区数等）

```
#kafka-topics.sh --create --zookeeper 10.0.0.6:2181,10.0.0.7:2181,10.0.0.8:2181 --replication-factor 1 --partitions 3 --topic topic123 
$ kafka-topics.sh --create --zookeeper 10.0.0.6:2181 --replication-factor 1 --partitions 3 --topic topic123
Created topic topic123.
#--replication-factor表示指定副本的个数
```

（3）查看某个topic的状态

```
#kafka-topics.sh --describe --zookeeper 10.0.0.6:2181,10.0.0.7:2181,10.0.0.8:2181 --topic topic123
$ kafka-topics.sh --describe --zookeeper 10.0.0.6:2181 --topic topic123
Topic: topic123	PartitionCount: 3	ReplicationFactor: 1	Configs: 
	Topic: topic123	Partition: 0	Leader: 1	Replicas: 1	Isr: 1
	Topic: topic123	Partition: 1	Leader: 1	Replicas: 1	Isr: 1
	Topic: topic123	Partition: 2	Leader: 1	Replicas: 1	Isr: 1
```

（4）生产消息 阻塞状态

```
#kafka-console-producer.sh --broker-list 10.0.0.6:9092,10.0.0.7:9092,10.0.0.8:9092 --topic topic123
$ kafka-console-producer.sh --broker-list 10.0.0.6:9092 --topic topic123
```

（5）消费消息 阻塞状态

```
#kafka-console-consumer.sh --bootstrap-server 10.0.0.6:9092,10.0.0.7:9092,10.0.0.8:9092 --topic topic123
$ kafka-console-consumer.sh --bootstrap-server 10.0.0.6:9092 --topic topic123
#从头开始消费消息
#kafka-console-consumer.sh --bootstrap-server 10.0.0.6:9092 --topic topic123 --from-beginning
$ kafka-console-consumer.sh --bootstrap-server 10.0.0.6:9092,10.0.0.7:9092,10.0.0.8:9092 --topic topic123 --from-beginning
```

（6）删除topic

```
#kafka-topics.sh --delete --zookeeper 10.0.0.6:2181,10.0.0.7:2181,10.0.0.8:2181 --topic topic123
$ kafka-topics.sh --delete --zookeeper 10.0.0.6:2181 --topic topic123
```



https://www.cnblogs.com/guangdelw/p/17282251.html