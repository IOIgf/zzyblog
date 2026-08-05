---
title: 树上 LCA
date: 2026-07-31 19:00:25
tags: [算法]
---

### 树上LCA

**倍增法**

设 $f_{i,j}$ 为第 $i$ 个点往上跳 $2^j$ 个点所到的点，显然 $f_{i,0}$ 为第 $i$ 个点的父亲。

对于点 $u,v$，我们只需要将它们调整至同一深度，然后一起往上跳（不能重合）直到不能再跳，则最后它们的父亲就是 $lca(u,v)$。

我们可以 $dfs$ 预处理出 $f_{i,0}$ 和 $deep_i$。时间复杂度为 $O(n)$。

对于 $f_{i,j}$，可以看做 $i$ 号点向上跳 $2^{j-1}$ 个点后再跳 $2^{j-1}$ 个点得到的，因为 $2^{j-1} \times 2 = 2^j = 2^{j-1} + 2^{j-1}$。

所以得到递推式：

$f_{i,j}=f_{f_{i,j-1},j-1}$

预处理 $f$ 数组复杂度为 $O(n log n)$

查询复杂度为 $O(log n)$

**代码**

```cpp
#include<bits/stdc++.h>
using namespace std;
int n,m,s;
vector<int>g[500005];
int f[500005][30],deep[500005];
void dfs(int x,int fa){
	f[x][0]=fa;
	deep[x]=deep[fa]+1;
	for(auto v:g[x]){
		if(v==fa)continue;
		dfs(v,x);
	}
}
int lca(int a,int b){
	if(deep[a]<deep[b])swap(a,b);
	for(int i=22;i>=0;i--){
		if(deep[f[a][i]]>=deep[b])a=f[a][i];
	}
	if(a==b)return a;
	for(int i=22;i>=0;i--){
		if(f[a][i]!=f[b][i]){
			a=f[a][i];
			b=f[b][i];
		}
	}
	return f[a][0];
}
int main(){
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);
	cin>>n>>m>>s;
	for(int i=1;i<n;i++){
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	dfs(s,0);
	for(int j=1;(1<<j)<=n;j++){
		for(int i=1;i<=n;i++){
			f[i][j]=f[f[i][j-1]][j-1];
		}
	}
	while(m--){
		int a,b;
		cin>>a>>b;
		cout<<lca(a,b)<<"\n";
	}
	return 0;
}
```

[P3379 【模板】最近公共祖先（LCA）](https://www.luogu.com.cn/problem/P3379)
