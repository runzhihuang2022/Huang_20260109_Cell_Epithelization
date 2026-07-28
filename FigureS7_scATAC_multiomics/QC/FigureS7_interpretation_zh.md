# Figure S7 数据解读

## 可保留的阳性结果

1. Fib_K14 marker accessibility 在预测的 Fib_K14 中显著升高：Cliff’s delta = 0.794，BH q = 5.59×10^-190。该结果支持 scATAC 标签转移得到的 Fib_K14-like 状态具有稳定的表皮样染色质可及性特征。
2. Klf4 ATAC gene score 与 TACSTD2 RNA 在排序对齐的状态轴上呈中等正相关：Pearson r = 0.531，P = 0.00367，BH q = 0.0183，n = 28。该结果支持 KLF4-related accessibility state 与 TACSTD2 表皮样表达程序同步变化。
3. Krt14、Krt5、Tacstd2 browser tracks 可作为来源数据的可视化支持，但因为目前只有聚合轨迹图而没有匹配的重复层面统计表，不能单独标注 P 值。

## 不应写成阳性的结果

1. 当前 peakAnnotation 中 KLF4 motif 命中数为 0，无法完成有效的 KLF4 footprinting；不能声称 KLF4 motif enrichment 或 footprinting 阳性。
2. Klf4 gene score 在预测 Fib_K14 中并未升高，反而轻度降低：Cliff’s delta = -0.057，BH q = 0.0486。
3. Fib_K14 内 Klf4 与 Krt14、Krt5、Pdgfra、Tp63、Tacstd2 的直接单细胞 ATAC gene-score 相关均不显著，最低 BH q = 0.401。
4. 当前 RNA 与 ATAC 是 rank-aligned pseudobulk，不是同一供体、同一细胞或配对 multiome，不能用于证明直接调控或因果关系。

## 推荐正文表述

“scATAC-seq label transfer identified a Fib_K14-like accessibility state with strong enrichment of the prespecified epithelial marker accessibility score. Rank-aligned cross-omics analysis further showed concordance between the Klf4 ATAC state axis and TACSTD2 RNA expression. However, KLF4 motif enrichment and footprinting were not supported by the supplied peak annotation, and direct single-cell ATAC correlations were not significant. These data support coordinated epithelial-like chromatin and transcriptional states, but do not establish direct KLF4 occupancy or causal chromatin remodeling.”
