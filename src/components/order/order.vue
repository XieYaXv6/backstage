<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time*1000|dateformat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showedit"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showlocation"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editdialogVisible" width="50%" @close="editclose">
      <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="100px">
        <el-form-item label="省市区/县" prop="addform1">
          <el-cascader :options="citydata" v-model="addform.addform1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addform2">
          <el-input v-model="addform.addform2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editdialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流 -->
    <el-dialog title="物流进度" :visible.sync="prodialogVisible" width="50%" @close="editclose">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressinfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="prodialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="prodialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from "./citydata.js";

export default {
  data() {
    return {
      queryinfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orderlist: [],
      editdialogVisible: false,
      addform: {
        addform1: [],
        addform2: "",
      },
      addformrules: {
        addform1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        addform2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      citydata,
      prodialogVisible: false,
      progressinfo: [],
    };
  },

  created() {
    this.getorderlist();
  },
  methods: {
    async getorderlist() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！");
      }
      this.$message.success("获取订单列表成功！");
      //console.log(res)
      this.total = res.data.total;
      this.orderlist = res.data.goods;
    },

    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize;
      this.getorderlist();
    },

    handleCurrentChange(newpage) {
      this.queryinfo.pagenum = newpage;
      this.getorderlist();
    },

    showedit() {
      this.editdialogVisible = true;
    },

    editclose() {
      this.$refs.addformref.resetFields();
    },

    async showlocation() {
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580");
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败！");
      }
      this.$message.success("获取物流信息成功！");
      this.progressinfo = res.data;
      //console.log(this.progressinfo);
      this.prodialogVisible = true;
    },
  },
};
</script>

<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>