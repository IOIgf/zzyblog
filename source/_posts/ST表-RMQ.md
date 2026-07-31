---
title: ST表&RMQ
date: 2026-07-31 19:04:59
tags:
---

### ST表&RMQ

ST表常用来快速求区间最值，即RMQ问题。

设 $f_{i,j}$ 表示区间 $[i,i+2^j-1]$ 中的最大值，显然 $f_{i,j}=max(f_{i,j-1},f_{i+2^{j-1},j-1})$。

查询时，我们设 $k=log_{2}(r-l+1)$，所以答案为 $max(f[l][k],f[r-2^k+1][k])$。

预处理 $f_{i,0}=a_i$。

**代码：**

```cpp
#include<bits/stdc++.h>
using namespace std;
int n,m;
int a[100005];
int logn;
int f[100005][20];
int main(){
	ios::sync_with_stdio(0);
	cin.tie(0),cout.tie(0);
	cin>>n>>m;
	logn=log2(n);
	for(int i=1;i<=n;i++){
		cin>>a[i];
		f[i][0]=a[i];
	}
	for(int j=1;j<=logn;j++){
		for(int i=1;i<=(n-(1<<j)+1);i++){
			f[i][j]=max(f[i][j-1],f[i+(1<<(j-1))][j-1]);
		}
	}
	while(m--){
		int l,r;
		cin>>l>>r;
		int k=log2(r-l+1);
		cout<<max(f[l][k],f[r-(1<<k)+1][k])<<'\n';
	}
	return 0;
}
```

