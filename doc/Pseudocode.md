###波函数坍缩地图生成算法伪代码
- 获取当前需要处理的Slot。
- 计算每个Slot中可选集合的熵，找出熵值最小的。
- 对当前选中Slot进行坍缩，坍缩过程是按概率值随机抽取模块。
- 传播，对剩余方向的邻居精简可选模型集合。
- 是否出错出错？
    - 是 ，回溯到步骤三。
    - 否 ，重复步骤二。
- 检查所有Slot是否坍缩完毕，是则完成结束。