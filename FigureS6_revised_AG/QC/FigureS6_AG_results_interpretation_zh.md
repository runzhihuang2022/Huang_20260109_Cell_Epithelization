# Figure S6 A–G 结果筛选与数据解读

## 可保留的阳性结果

1. **预定义 KLF4 靶基因集活性在 Fib_K14 中升高。** Fib_K14 的平均靶基因集活性为 0.1015，高于其他成纤维细胞总体；Fib_K14 在已注释成纤维细胞亚群中均值最高。该结果支持 KLF4 相关转录程序增强，但它是预定义靶基因集的 rescue analysis，不能写成正式 SCENIC KLF4 regulon AUC。
2. **单细胞层面的 KLF4–上皮相关基因共变。** 在 4,734 个 Fib_K14 细胞中，KLF4 与 GRHL3、TP63、TACSTD2 呈正相关，BH 校正后显著；其中 TACSTD2 的相关性最强（rho = 0.345）。KLF4 与 ACTA2 呈负相关（rho = -0.105），FN1 不显著。该层面存在伪重复风险，只能作为描述性支持。
3. **OSKM 并非整体激活。** POU5F1 和 SOX2 在 Fib_K14 中极低或稀疏；KLF4 和 MYC 可检测，但并不特异于 Fib_K14。该结果支持“局部 KLF4 相关可塑性”，不支持完整 iPSC/多能性重编程。
4. **源实验材料支持 KLF4-OE 后的表型改变。** 当前实验图显示 KRT14 阳性比例升高以及细胞长度、长宽比随时间下降。由于原始逐细胞表格缺失，这部分作为 source-reported evidence 保留，不能声称本次重新计算了 P 值。
5. **源报告 GSEA 的方向与文章机制相符。** 表皮发育、角质形成细胞分化、上皮细胞分化为正向富集；细胞外基质组织和血管生成为负向富集。因缺少 RNA-seq 排名文件，本次只重绘已报告 ES/P 值，未独立复跑 GSEA。

## 不应继续保留的过强表述

1. **“KLF4 SCENIC regulon 在 Fib_K14 中选择性激活”缺少正式数据支持。** 供应的正式 SCENIC RSS 矩阵含 206 个 regulon，但没有 KLF4 regulon。
2. **样本层面相关性未通过多重校正。** 在 32 个样本的 Fib_K14 均值分析中，GRHL3、TP63、TACSTD2、COL1A1、ACTA2 和 FN1 的 BH 校正 q 值均大于 0.05。不能写成“上皮相关基因均显著正相关、瘢痕基因均显著负相关”。
3. **空间梯度并不稳定复现。** 19 dpb 切片中 OSKM 轴相关性均未显著；19 dpb p1 中 KLF4 对表面轴仅呈极弱相关（rho = 0.0215，q = 0.0346），且 KLF4 在 Epi-Front 与 Un-epi 的区域均值接近。应表述为“空间分布与局部上皮化区域部分重叠”，而不是“特异富集”。
4. **Monocle2 不支持单调升高。** 14,356 个细胞中，KLF4 与伪时序的细胞级 Spearman rho = -0.0598，趋势弱且非单调。该图适合展示轨迹位置和异质性，不适合声称 KLF4 随伪时序持续增强。

## 建议 Results 结论

综合证据更稳妥的结论是：**KLF4 与 Fib_K14 的部分上皮样转录程序及 KLF4-OE 后的形态/标志物改变一致，但正式 SCENIC、样本层面相关性和独立 GSEA 重算尚不足以支持“KLF4 在 Fib_K14 中选择性激活并驱动完整重编程”的强因果表述。** 建议使用“promotes epithelial-like plasticity”而非“induces fate conversion”或“pluripotent reprogramming”。
